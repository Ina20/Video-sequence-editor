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

def luminosity():
    print("Hello from Python LM")
    video_name = sys.argv[2]
    lbv = float(sys.argv[3])
    lcv = float(sys.argv[4])
    print(video_name)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.lum_contrast, lum=lbv, contrast=lcv, contrast_thr=127))
    newclip.write_videofile("./videos/lm_" + video_name)
    print("LuminosityOK")
    sys.stdout.flush()

def gamma():
    print("Hello from Python G")
    video_name = sys.argv[2]
    gv = float(sys.argv[3])
    print(video_name)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.gamma_corr, gv))
    newclip.write_videofile("./videos/g_" + video_name)
    print("gammaOK")
    sys.stdout.flush()

def blackwhite():
    print("Hello from Python BW")
    video_name = sys.argv[2]
    print(video_name)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.blackwhite, RGB=None, preserve_luminosity=True))
    newclip.write_videofile("./videos/bw_" + video_name)
    print("BlackWhiteOK")
    sys.stdout.flush()

def brightness():
    print("Hello from Python BR")
    video_name = sys.argv[2]
    bv = float(sys.argv[3])
    print(video_name)
    print(bv)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.colorx, bv))
    newclip.write_videofile("./videos/br_" + video_name)
    print("BrightnessOK")
    sys.stdout.flush()

def fade():
    print("Hello from Python F")
    video_name = sys.argv[2]
    inOut = sys.argv[3]
    dur = float(sys.argv[4])
    print(video_name)
    print(inOut)
    print(dur)
    video = VideoFileClip("./videos/" + video_name)
    if inOut == "fadeIn":
        print("hello from fadeIn")
        newclip = (video.fx( vfx.fadein, dur, initial_color=None))
        newclip.write_videofile("./videos/f_" + video_name)
    elif inOut == "fadeOut":
        print("hello from fadeout")
        newclip = (video.fx( vfx.fadeout, dur, final_color=None))
        newclip.write_videofile("./videos/f_" + video_name)
    print("FadeOK")
    sys.stdout.flush()

def mirror():
    print("Hello from Python M")
    video_name = sys.argv[2]
    xy = sys.argv[3]
    video = VideoFileClip("./videos/" + video_name)
    if xy == "X":
        print("hello from X")
        newclip = (video.fx( vfx.mirror_x, apply_to='mask'))
        newclip.write_videofile("./videos/m_" + video_name)
    elif xy == "Y":
        print("hello from Y")
        newclip = (video.fx( vfx.mirror_y, apply_to='mask'))
        newclip.write_videofile("./videos/m_" + video_name)
    print("MirrorOK")
    sys.stdout.flush()


def time_symetrize(clip):
    """ Returns the clip played forwards then backwards. In case
    you are wondering, vfx (short for Video FX) is loaded by
    >>> from moviepy.editor import * """
    return concatenate([clip, clip.fx( vfx.time_mirror )])

def loop():
    print("Hello from Python Loop")
    video_name = sys.argv[2]
    ts = float(sys.argv[3])
    te = float(sys.argv[4])
    print(video_name)
    print(ts)
    print(te)

    split_string = video_name.split(".", 1)
    output_name = split_string[0]
    print(output_name)

    clip = (VideoFileClip("./videos/" + video_name, audio=False)
        .subclip(ts,te)
        .resize(0.5)
        .fx( time_symetrize ))
    clip.write_gif("./videos/" + output_name + ".gif", fps=15, fuzz=2)
    print("LoopOK")
    sys.stdout.flush()

def rotate():
    print("Hello from Python R")
    video_name = sys.argv[2]
    angle = float(sys.argv[3])
    print(video_name)
    print(angle)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.rotate, angle, unit='deg', resample='bicubic', expand=True))
    newclip.write_videofile("./videos/r_" + video_name)
    print("rotateOK")
    sys.stdout.flush()

def crop():
    print("Hello from Python C")
    video_name = sys.argv[2]
    x1 = int(sys.argv[3])
    x2 = int(sys.argv[4])
    y1 = int(sys.argv[5])
    y2 = int(sys.argv[6])
    width = int(sys.argv[7])
    height = int(sys.argv[8])
    #xcenter = int(sys.argv[9])
    #ycenter = int(sys.argv[10])
    print(x2)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.crop, x1=x1, y1=y1, x2=x2, y2=y2, width=width, height=height))
    newclip.write_videofile("./videos/c_" + video_name)
    print("cropOK")
    sys.stdout.flush()

def speed():
    print("Hello from Python S")
    video_name = sys.argv[2]
    sx = float(sys.argv[3])
    #sfd = float(sys.argv[4])
    print(video_name)
    print(sx)
    #print(sfd)
    video = VideoFileClip("./videos/" + video_name)
    newclip = (video.fx( vfx.speedx, factor=sx))
    newclip.write_videofile("./videos/s_" + video_name)
    print("speedOK")
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
        'luminosity': luminosity,
        'blackwhite': blackwhite,
        'brightness': brightness,
        'gamma': gamma,
        'fade': fade,
        'mirror': mirror,
        'loop': loop,
        'rotate': rotate,
        'crop': crop,
        'speed': speed,
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
