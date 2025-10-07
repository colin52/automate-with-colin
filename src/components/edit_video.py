import os
from moviepy.editor import VideoFileClip, AudioFileClip

# --- Configuration ---
# Make sure your video is in the same folder as this script
VIDEO_FILE_NAME = "my_video.mp4"
FINAL_VIDEO_OUTPUT_NAME = "my_video_no_voice.mp4"
TEMP_AUDIO_FOLDER = "temp_audio_output"

# --- Step 1: Extract the original audio from the video ---
print("Step 1: Extracting audio from the video...")
video_clip = VideoFileClip(VIDEO_FILE_NAME)
original_audio_path = os.path.join(TEMP_AUDIO_FOLDER, "original_audio.wav")

# Create the temporary folder if it doesn't exist
os.makedirs(TEMP_AUDIO_FOLDER, exist_ok=True)

# Write the audio to a file
video_clip.audio.write_audiofile(original_audio_path)
print(f"Audio extracted successfully to: {original_audio_path}")


# --- Step 2: Use Spleeter to separate the voice from other sounds ---
# We use a system call to run Spleeter. It's simple and effective.
# This tells Spleeter to separate the audio into 2 stems: vocals and accompaniment.
print("\nStep 2: Separating voice from background sounds... (This may take a while!)")
spleeter_command = f"spleeter separate -p spleeter:2stems -o {TEMP_AUDIO_FOLDER} {original_audio_path}"

# The `shell=True` part makes it run in the terminal
os.system(spleeter_command)

print("Audio separation complete!")
# Spleeter will create a new folder inside 'temp_audio_output'
# The file we want is 'accompaniment.wav'


# --- Step 3: Combine the video with the new audio (without the voice) ---
print("\nStep 3: Merging video with the new audio track...")
# The path to the audio file WITHOUT the vocals
new_audio_path = os.path.join(TEMP_AUDIO_FOLDER, "original_audio", "accompaniment.wav")

# Load our new audio
new_audio_clip = AudioFileClip(new_audio_path)

# Assign the new audio to our original video clip (which still has its old audio)
final_clip = video_clip.set_audio(new_audio_clip)

# Write the final video file
final_clip.write_videofile(FINAL_VIDEO_OUTPUT_NAME, codec='libx264', audio_codec='aac')

print(f"\n✅ All done! Your new video is saved as: {FINAL_VIDEO_OUTPUT_NAME}")