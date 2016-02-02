#!/usr/bin/env python
import urllib2, json, os, random

API='https://8ball.delegator.com/magic/JSON/'


def get_answers(question):
    try:
        r = urllib2.urlopen(url=API + question, timeout=1)
        data = json.loads(r.read())
    except urllib2.URLError:
        path = os.getcwd()
        r = urllib2.urlopen(url="file://%s/backup.json" % path)
        data = random.choice(json.loads(r.read()))
    finally:
        answer = data['magic']['answer']
        answer_type = data ['magic']['type']

        return answer, answer_type


def main():
    module = AnsibleModule(
        argument_spec=dict(
            question = dict(required=True, type='str')
            )
        )

    question = module.params['question']

    answer, answer_type = get_answers(question)

    if answer_type not in ['Affirmative', 'Neutral']:
        module.fail_json(msg="Negative answer", answer=answer, answer_type=answer_type)
    else:
        module.exit_json(changed=False, answer=answer, type=answer_type)


from ansible.module_utils.basic import *
if __name__ == '__main__':
    main()
