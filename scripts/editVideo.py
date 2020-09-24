import sys, json
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip


video_name = sys.argv[1]

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def trim():
    print("Python Trim")
    print(path)
    ffmpeg_extract_subclip("./uploads/" + video_name, 2, 6, targetname="./results/trim_" + video_name )

#lines = read_in()
#print('Python')
#print(lines["name"])

#y = json.dumps(lines)
#print(y)

#print(sys.argv[1]["name"])
#sys.argv[1] = 'Hello from Python'
#print(sys.argv[1])
trim()

sys.stdout.flush()
