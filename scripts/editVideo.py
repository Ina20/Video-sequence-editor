import sys, json
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import VideoFileClip, concatenate_videoclips




def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def trim():
    video_name = sys.argv[1]
    t1 = int(sys.argv[2])
    t2 = int(sys.argv[3])
    print("Python Trim")
    ffmpeg_extract_subclip("./uploads/" + video_name, t1, t2, targetname="./results/trim_" + video_name )
    print("TrimOK")
    sys.stdout.flush()

def join():
    video_array = []
    video_list = sys.argv[1].split(',')
    for video in video_list:
        video_array.append(VideoFileClip("./uploads/" + video))
    final_video = concatenate_videoclips(video_array, method='compose')
    final_video.write_videofile("./results/join.mp4")
    print("JoinOK")
    sys.stdout.flush()

#lines = read_in()
#print('Python')
#print(lines["name"])

#y = json.dumps(lines)
#print(y)

#print(sys.argv[1]["name"])
#sys.argv[1] = 'Hello from Python'
#print(sys.argv[1])
#trim()
join()
