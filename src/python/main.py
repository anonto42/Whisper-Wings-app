import asyncio
import os
import contextlib
import wave
import speech_recognition as sr
from pydub import AudioSegment
from fastapi import FastAPI, HTTPException, Request
from spleeter.separator import Separator

app = FastAPI()

# Step 1: Convert MP3 to WAV
def convert_mp3_to_wav(mp3_path, wav_path):
    sound = AudioSegment.from_mp3(mp3_path)
    os.makedirs(os.path.dirname(wav_path), exist_ok=True)
    sound.export(wav_path, format="wav")
    print(f"Converted {mp3_path} to {wav_path}")

# Step 2: Get Audio Duration
def get_audio_duration(audio_path):
    with contextlib.closing(wave.open(audio_path, 'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        return frames / float(rate)

# Step 3: Generate LRC File
def generate_lrc(lyrics, timestamps, output_path="output.lrc"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w') as f:
        for idx, line in enumerate(lyrics):
            minutes = timestamps[idx] // 60
            seconds = timestamps[idx] % 60
            f.write(f"[{minutes:02}:{seconds:02}.00] {line}\n")
    print(f"LRC file saved to {output_path}")

# Step 4: Use Spleeter to isolate vocals from the song
def isolate_vocals(mp3_path, output_folder):
    separator = Separator('spleeter:2stems')
    separator.separate_to_file(mp3_path, output_folder)
    return os.path.join(output_folder, 'vocals.wav')

# Step 5: Transcribe isolated vocals using Google Speech API
def transcribe_audio(vocal_audio_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(vocal_audio_path) as source:
        audio = recognizer.record(source)
    
    try:
        lyrics = recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        lyrics = "Could not understand the audio"
    except sr.RequestError as e:
        lyrics = f"Request error: {e}"

    return lyrics

# Step 6: Transcribe the entire audio file concurrently (segmentation is optional)
async def transcribe_audio_concurrent(audio_path, output_lrc_path):
    # Step 1: Isolate vocals
    vocal_audio_path = isolate_vocals(audio_path, "output_folder")

    # Step 2: Transcribe isolated vocals
    lyrics = transcribe_audio(vocal_audio_path)
    
    # Step 3: Generate LRC (timestamps are not generated in this simple version)
    timestamps = [0]  # Assuming a simple case where the entire transcription is one chunk
    generate_lrc([lyrics], timestamps, output_lrc_path)

    # Clean up the isolated vocals
    os.remove(vocal_audio_path)

@app.post("/uploadfile")
async def upload_file(request: Request):
    request_data = await request.json()

    # Step 1: Validate the file name in the request
    if not request_data["fileName"]:
        raise HTTPException(status_code=400, detail="File name is required")

    # Step 2: Define the file path
    audio_path = f"../../uploads/{request_data['fileName']}"
    output_lrc_path = f"../../uploads/lrc{request_data['fileName'].split('.')[0]}.lrc"

    # Step 3: Make sure the output directory exists
    os.makedirs(os.path.dirname(output_lrc_path), exist_ok=True)

    # Step 4: Process the audio and generate LRC
    await transcribe_audio_concurrent(audio_path, output_lrc_path)

    return {"message": "Audio processed successfully", "lrc_file": f"/lrc{request_data['fileName'].split('.')[0]}.lrc"}
