import sys, json
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip


video_name = sys.argv[1]
t1 = int(sys.argv[2])
t2 = int(sys.argv[3])

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def trim():
    print("Python Trim")
    ffmpeg_extract_subclip("./uploads/" + video_name, t1, t2, targetname="./results/trim_" + video_name )
    print("TrimOK")
    sys.stdout.flush()

#lines = read_in()
#print('Python')
#print(lines["name"])

#y = json.dumps(lines)
#print(y)

#print(sys.argv[1]["name"])
#sys.argv[1] = 'Hello from Python'
#print(sys.argv[1])
trim()
