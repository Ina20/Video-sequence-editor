import sys, json

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])


lines = read_in()
#print('Python')
#print(lines["name"])

y = json.dumps(lines)
print(y)

sys.stdout.flush()
