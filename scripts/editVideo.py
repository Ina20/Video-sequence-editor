import sys, json
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import VideoFileClip, concatenate_videoclips
import moviepy.video.fx.all as vfx
import cv2


def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def trim():
    print("Hello from Python!")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    t1 = int(data['t1'])
    t2 = int(data['t2'])
    print(t1)
    try:
        ffmpeg_extract_subclip("./videos/" + video_name, t1, t2, targetname="./videos/trim_" + video_name)
        print("Trim_OK")
        #sys.stdout.flush()
    except Exception:
        print("Trim_NotOK")
        #sys.stdout.flush()

def join():
    video_array = []
    video_name = ''
    try:
        video_list = sys.argv[2].split(',')
        print(video_list)
        for video in video_list:
            video_array.append(VideoFileClip("./videos/" + video))
        video_name = video_list[0]
        final_video = concatenate_videoclips(video_array, method='compose')
        final_video.write_videofile("./videos/join_" + video_name)
        print("Join_OK")
    except Exception:
        print("Join_NotOK")
    #sys.stdout.flush()

def luminosity():
    print("Hello from Python LM")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    lbv = float(data['lbv'])
    lcv = float(data['lcv'])
    print(video_name)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.lum_contrast, lum=lbv, contrast=lcv, contrast_thr=127))
        newclip.write_videofile("./videos/lm_" + video_name)
        print("Luminosity_OK")
    except Exception:
        print("Luminosity_NotOK")
    #sys.stdout.flush()

def gamma():
    print("Hello from Python G")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    gv = float(data['gv'])
    print(video_name)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.gamma_corr, gv))
        newclip.write_videofile("./videos/g_" + video_name)
        print("gamma_OK")
    except Exception:
        print("gamma_NotOK")
    #sys.stdout.flush()

def blackwhite():
    print("Hello from Python BW")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    print(video_name)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.blackwhite, RGB=None, preserve_luminosity=True))
        newclip.write_videofile("./videos/bw_" + video_name)
        print("BlackWhite_OK")
    except Exception:
        print("BlackWhite_NotOK")
    #sys.stdout.flush()

def brightness():
    print("Hello from Python BR")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    bv = float(data['bv'])
    print(video_name)
    print(bv)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.colorx, bv))
        newclip.write_videofile("./videos/br_" + video_name)
        print("Brightness_OK")
    except Exception:
        print("Brightness_NotOK")
    #sys.stdout.flush()

def fade():
    print("Hello from Python F")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    inOut = data['inOut']
    dur = float(data['fd'])
    print(video_name)
    print(inOut)
    print(dur)
    try:
        video = VideoFileClip("./videos/" + video_name)
        if inOut == "fadeIn":
            print("hello from fadeIn")
            newclip = (video.fx( vfx.fadein, dur, initial_color=None))
            newclip.write_videofile("./videos/f_" + video_name)
        elif inOut == "fadeOut":
            print("hello from fadeout")
            newclip = (video.fx( vfx.fadeout, dur, final_color=None))
            newclip.write_videofile("./videos/f_" + video_name)
        print("Fade_OK")
    except Exception:
        print("Fade_NotOK")
    #sys.stdout.flush()

def mirror():
    print("Hello from Python M")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    xy = data['xy']
    try:
        video = VideoFileClip("./videos/" + video_name)
        if xy == "X":
            print("hello from X")
            newclip = (video.fx( vfx.mirror_x, apply_to='mask'))
            newclip.write_videofile("./videos/m_" + video_name)
        elif xy == "Y":
            print("hello from Y")
            newclip = (video.fx( vfx.mirror_y, apply_to='mask'))
            newclip.write_videofile("./videos/m_" + video_name)
        print("Mirror_OK")
    except Exception:
        print("Mirror_NotOK")
    #sys.stdout.flush()


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

    try:
        split_string = video_name.split(".", 1)
        output_name = split_string[0]
        print(output_name)

        clip = (VideoFileClip("./videos/" + video_name, audio=False)
            .subclip(ts,te)
            .resize(0.5)
            .fx( time_symetrize ))
        clip.write_gif("./videos/" + output_name + ".gif", fps=15, fuzz=2)
        print("Loop_OK")
    except Exception:
        print("Loop_NotOK")
    #sys.stdout.flush()

def fps():
    print("Hello from Python FPS")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    fps = int(data['fps'])
    try:
        video = VideoFileClip("./videos/" + video_name)
        videoCV = cv2.VideoCapture("./videos/" + video_name)
        fpsCV = videoCV.get(cv2.CAP_PROP_FPS)
        print(fpsCV)
        video.write_videofile("./videos/fps_" + video_name, fps=fps);
        videoCVAfter = cv2.VideoCapture("./videos/fps_" + video_name)
        fpsCV2 = videoCVAfter.get(cv2.CAP_PROP_FPS)
        print(fpsCV2)
        print("FPS_OK")
    except Exception:
        print("FPS_NotOK")

def rotate():
    print("Hello from Python R")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    angle = float(data['rv'])
    print(video_name)
    print(angle)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.rotate, angle, unit='deg', resample='bicubic', expand=True))
        newclip.write_videofile("./videos/r_" + video_name)
        print("Rotate_OK")
    except Exception:
        print("Rotate_NotOK")
    #sys.stdout.flush()

def crop():
    print("Hello from Python C")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    x1 = int(data['x1'])
    x2 = int(data['x2'])
    y1 = int(data['y1'])
    y2 = int(data['y2'])
    width = int(data['width'])
    height = int(data['height'])
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.crop, x1=x1, y1=y1, x2=x2, y2=y2, width=width, height=height))
        newclip.write_videofile("./videos/c_" + video_name)
        print("Crop_OK")
    except Exception:
        print("Crop_NotOK")
    #sys.stdout.flush()

def speed():
    print("Hello from Python S")
    data = json.loads(sys.argv[2])
    video_name = data['name']
    sx = float(data['sx'])
    #sfd = float(sys.argv[4])
    print(video_name)
    print(sx)
    #print(sfd)
    try:
        video = VideoFileClip("./videos/" + video_name)
        newclip = (video.fx( vfx.speedx, factor=sx))
        newclip.write_videofile("./videos/s_" + video_name)
        print("Speed_OK")
    except Exception:
        print("Speed_NotOK")
    #sys.stdout.flush()

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
        'fps': fps,
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
