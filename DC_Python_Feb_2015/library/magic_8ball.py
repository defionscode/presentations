#!/usr/bin/env python
import random

def get_answers(question):
    try:
        API = 'https://8ball.delegator.com/magic/JSON/%s' % question
        r = open_url(API, http_agent='ansible') 
        data = json.loads(r.read())
    # Just in case the API is down, we'll open a local file with a json structure
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
from ansible.module_utils.urls import * 
if __name__ == '__main__':
    main()
