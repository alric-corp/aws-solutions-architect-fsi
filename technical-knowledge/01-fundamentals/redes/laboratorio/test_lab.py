"""Positivos, negativos, transferência e integrações somente em loopback próprio."""
import ipaddress
import json
import os
import secrets
from pathlib import Path
import socket
import sys
import unittest
sys.dont_write_bytecode = True
import lab


class Mathematics(unittest.TestCase):
    def test_capacity_separates_conventions_and_aws_scope(self):
        for cidr, total, aws in [('10.20.0.0/16', 65536, 65531), ('10.20.16.0/20', 4096, 4091),
                                 ('10.20.2.0/24', 256, 251), ('10.20.2.0/28', 16, 11)]:
            with self.subTest(cidr=cidr):
                result = lab.capacity(cidr, True)
                self.assertEqual(result['total'], total)
                self.assertEqual(result['hosts_convencionais'], total - 2)
                self.assertEqual(result['aws_comum_atribuiveis'], aws)
        self.assertEqual(lab.capacity('10.20.2.0/31')['hosts_convencionais'], 2)
        with self.assertRaises(ValueError): lab.capacity('10.20.2.0/31', True)
        with self.assertRaises(ValueError): lab.capacity('2001:db8::/64', True)

    def test_alignment_containment_and_transfer(self):
        with self.assertRaises(ValueError): lab.capacity('10.20.17.0/20')
        self.assertEqual(str(ipaddress.ip_interface('10.20.17.0/20').network), '10.20.16.0/20')
        self.assertIn(ipaddress.ip_address('10.20.2.10'), ipaddress.ip_network('10.20.2.0/24'))
        self.assertNotIn(ipaddress.ip_address('10.20.3.20'), ipaddress.ip_network('10.20.2.0/24'))
        self.assertTrue(ipaddress.ip_network('10.20.16.0/20').subnet_of(ipaddress.ip_network('10.20.0.0/16')))
        self.assertFalse(ipaddress.ip_network('10.20.2.0/24').overlaps(ipaddress.ip_network('10.30.2.0/24')))
        self.assertEqual(len(list(ipaddress.ip_network('10.20.16.0/20').subnets(new_prefix=24))), 16)
        # New destination and host-specific route change the answer, not a memorized octet.
        records = lab.fixture('rotas.json')
        for item in records['queries']:
            self.assertEqual(lab.longest_prefix(item['address'], records['routes'])['target'], item['expected'])
        transferred = records['routes'] + [{'cidr': '10.20.3.20/32', 'target': 'host-ficticio'}]
        self.assertEqual(lab.longest_prefix('10.20.3.20', transferred)['target'], 'host-ficticio')
        self.assertEqual(lab.longest_prefix('10.20.3.21', transferred)['target'], 'inspecao-ficticia')
        self.assertIsNone(lab.longest_prefix('10.40.2.10', [{'cidr': '10.30.0.0/16', 'target': 'B'}]))
        with self.assertRaises(ValueError): lab.longest_prefix('10.20.2.10', [{'cidr': '10.20.0.0/16', 'target': 'A'}, {'cidr': '10.20.0.0/16', 'target': 'B'}])


class RecordInterpretation(unittest.TestCase):
    def test_return_port_and_changed_client(self):
        fixture = lab.fixture('controles.json')
        self.assertEqual(lab.nacl_record(fixture['request'], fixture['app_out'])['action'], 'allow')
        self.assertEqual(lab.nacl_record(fixture['response'], fixture['app_in_broken'])['action'], 'deny')
        self.assertEqual(lab.nacl_record(fixture['response'], fixture['app_in_fixed'])['action'], 'allow')
        transferred = dict(fixture['response'], dst_port=51000)
        self.assertEqual(lab.nacl_record(transferred, fixture['app_in_fixed'])['action'], 'allow')
        self.assertEqual(lab.nacl_record(dict(transferred, dst_port=62000), fixture['app_in_fixed'])['action'], 'deny')
        self.assertEqual(lab.nacl_record(fixture['request'], fixture['db_in'])['action'], 'allow')
        self.assertEqual(lab.nacl_record(fixture['response'], fixture['db_out'])['action'], 'allow')
        # Earlier matching deny wins; the fixture is not a union of all allow rules.
        rules = [dict(fixture['app_in_fixed'][0], number=50, action='deny'), *fixture['app_in_fixed']]
        self.assertEqual(lab.nacl_record(fixture['response'], rules), {'action': 'deny', 'rule': 50})

    def test_topology_and_contingency_do_not_prove_application(self):
        result = lab.run_l5()
        self.assertFalse(result['peering_A_C_direct'])
        self.assertEqual(result['tgw_A_B']['target'], 'attachment-B')
        self.assertEqual(result['tgw_B_A_return']['target'], 'attachment-A')
        self.assertIsNone(result['tgw_A_C'])
        records = result['contingency_records']
        self.assertNotEqual(records['existing_connection']['peer'], records['authoritative_answer_after_change'])
        self.assertEqual(records['new_connection_after_fresh_lookup']['health_http'], 200)
        self.assertEqual(records['new_connection_after_fresh_lookup']['checkout_http'], 503)


class Ownership(unittest.TestCase):
    def test_only_owned_runtime_can_be_removed(self):
        with lab.runtime() as (work, token):
            with self.assertRaises(ValueError): lab.safe_cleanup(work, 'not-the-marker')
            self.assertTrue(work.exists())
            with self.assertRaises(ValueError): lab.safe_cleanup(lab.ROOT, token)
        self.assertFalse(work.exists())

    def test_reject_external_url_or_unmapped_name_before_curl(self):
        with lab.runtime() as (work, _):
            for url in ['https://example.com:443/ok', 'http://10.20.2.10:8080/ok', 'http://127.0.0.1:80/ok', 'https://loja.test:55555/ok']:
                with self.subTest(url=url), self.assertRaises(ValueError): lab.curl_local(url, work)


class LocalExecutions(unittest.TestCase):
    def test_http_process_port_and_status_are_distinct(self):
        with lab.runtime() as (work, token):
            result = lab.run_l2(work, token)
            self.assertEqual((result['ok']['exit'], result['ok']['http']), (0, '200'))
            self.assertEqual((result['http503']['exit'], result['http503']['http']), (0, '503'))
            self.assertEqual((result['http503_fail_with_body']['exit'], result['http503_fail_with_body']['http']), (22, '503'))
            self.assertEqual((result['no_listener']['exit'], result['no_listener']['http']), (7, '000'))
            self.assertEqual(result['ok']['remote_ip'], '127.0.0.1')
            with socket.socket() as client:
                self.assertNotEqual(client.connect_ex(('127.0.0.1', result['server']['port'])), 0)

    def test_timeout_occurs_after_request_reaches_handler(self):
        with lab.runtime() as (work, token):
            result = lab.run_l3(work, token)
            self.assertEqual((result['budget_short']['exit'], result['budget_short']['http']), (28, '000'))
            self.assertEqual((result['budget_long']['exit'], result['budget_long']['http']), (0, '200'))
            self.assertEqual(len(result['handler_requests']), 2)
            self.assertGreater(result['budget_long']['time_starttransfer'], 0.3)

    def test_inherited_keylog_cannot_create_or_append_outside_runtime(self):
        lab.REPORTS.mkdir(parents=True, exist_ok=True)
        # Synthetic path created by this test only; never inspect the real value.
        sentinel = lab.REPORTS / ('keylog-sentinel-' + secrets.token_hex(12))
        original = b'owned sentinel: must remain byte-identical\n'
        try:
            for preexisting in [False, True]:
                if preexisting:
                    sentinel.write_bytes(original)
                    sentinel.chmod(0o600)
                os.environ['SSLKEYLOGFILE'] = str(sentinel)
                self.assertNotIn('SSLKEYLOGFILE', lab.clean_env())
                with lab.runtime() as (work, token):
                    result = lab.run_l4(work, token)
                    self.assertEqual(result['trusted']['http'], '200')
                    self.assertEqual(result['wrong_name']['exit'], 60)
                self.assertNotIn('SSLKEYLOGFILE', os.environ)
                if preexisting:
                    self.assertEqual(sentinel.read_bytes(), original)
                else:
                    self.assertFalse(sentinel.exists())
        finally:
            # Only this test's exact, randomly named file is ever removed.
            sentinel.unlink(missing_ok=True)
            lab.disable_tls_keylog()

    def test_ca_trust_name_and_real_negotiated_tls(self):
        with lab.runtime() as (work, token):
            result = lab.run_l4(work, token)
            self.assertEqual(result['untrusted']['exit'], 60)
            self.assertEqual((result['trusted']['exit'], result['trusted']['http']), (0, '200'))
            self.assertEqual(result['wrong_name']['exit'], 60)
            self.assertEqual(result['python_mismatch']['verify_code'], 62)
            self.assertIn(('DNS', 'loja.test'), result['python_tls']['san'])
            self.assertTrue(result['curl_tls_seen_by_server'])
            for observed in result['curl_tls_seen_by_server']:
                self.assertIn(observed['version'], {'TLSv1.2', 'TLSv1.3'})
                self.assertTrue(observed['host'].startswith('loja.test:'))
            for filename in ['ca.key', 'server.key', 'ca.crt', 'server.crt']:
                self.assertEqual((work/filename).stat().st_mode & 0o777, 0o600)
        self.assertFalse(work.exists())


if __name__ == '__main__':
    unittest.main(verbosity=2)
