import sys, json
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import VideoFileClip, concatenate_videoclips
import moviepy.video.fx.all as vfx




def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def trim():
    video_name = sys.argv[2]
    t1 = int(sys.argv[3])
    t2 = int(sys.argv[4])
    print("Python Trim")
    ffmpeg_extract_subclip("./videos/" + video_name, t1, t2, targetname="./videos/trim_" + video_name)
    print("TrimOK")
    sys.stdout.flush()

def join():
    video_array = []
    video_name = ''
    video_list = sys.argv[2].split(',')
    for video in video_list:
        video_array.append(VideoFileClip("./videos/" + video))
    video_name = video_list[0]
    final_video = concatenate_videoclips(video_array, method='compose')
    final_video.write_videofile("./videos/join_" + video_name)
    print("JoinOK")
    sys.stdout.flush()

def blackwhite():
    print("Hello from Python BW")
    video_name = sys.argv[2]
    print(video_name)
    tmp = VideoFileClip("./videos/" + video_name)
    tmp2 = "./videos/" + video_name
    #final_video = moviepy.video.fx.all.blackwhite(tmp, RGB=None, preserve_luminosity=True)
    newclip = (tmp.fx( vfx.blackwhite, RGB=None, preserve_luminosity=True))
    newclip.write_videofile("./videos/bw_" + video_name)
    print("BlackWhiteOK")
    sys.stdout.flush()


#lines = read_in()
#print('Python')
#print(lines["name"])

#y = json.dumps(lines)
#print(y)

#print(sys.argv[1]["name"])
#sys.argv[1] = 'Hello from Python'
#print(sys.argv[1])
def filters(argument):
    switcher = {
        'blackwhite': blackwhite,
    }
    func = switcher.get(argument, lambda: "Invalid argument")
    return func()

if sys.argv[1] == "trim":
    trim()
elif sys.argv[1] == "join":
    join()
else:
    filters(sys.argv[1])
#elif sys.argv[1] == "blackwhite":
#    blackwhite()
