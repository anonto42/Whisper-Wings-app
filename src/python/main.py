import speech_recognition as sr
from pydub import AudioSegment
import os
import contextlib
import wave
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException

app = FastAPI()

def convert_mp3_to_wav(mp3_path, wav_path):
    sound = AudioSegment.from_mp3(mp3_path)

    os.makedirs(os.path.dirname(wav_path), exist_ok=True)

    sound.export(wav_path, format="wav")
    print(f"Converted {mp3_path} to {wav_path}")

def get_audio_duration(audio_path):
    with contextlib.closing(wave.open(audio_path, 'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)
        return duration

def generate_lrc(lyrics, timestamps, output_path="output.lrc"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w') as f:
        for idx, line in enumerate(lyrics):
            minutes = timestamps[idx] // 60
            seconds = timestamps[idx] % 60
            f.write(f"[{minutes:02}:{seconds:02}.00] {line}\n")
    print(f"LRC file saved to {output_path}")

def transcribe_audio(audio_path, LRCName):
    recognizer = sr.Recognizer()

    wav_path = f"./temp/{LRCName}.wav"
    convert_mp3_to_wav(audio_path, wav_path)

    lyrics = []
    timestamps = []

    with sr.AudioFile(wav_path) as source:
        
        duration = get_audio_duration(wav_path)
        segment_duration = 3

        for start_time in range(0, int(duration), segment_duration):
            end_time = start_time + segment_duration
            print(f"Processing segment from {start_time}s to {end_time}s")
            with sr.AudioFile(wav_path) as source:
                audio_segment = recognizer.record(source, duration=segment_duration, offset=start_time)

            try:
                text = recognizer.recognize_google(audio_segment)
                print(f"Recognized text: {text}")

                lyrics.append(text)
                timestamps.append(start_time)

            except sr.UnknownValueError:
                print(f"Could not understand audio segment from {start_time}s to {end_time}s")
                lyrics.append("")
                timestamps.append(start_time)
            except sr.RequestError as e:
                print(f"Request error: {e}")
                break

        os.remove(wav_path)

        generate_lrc(lyrics, timestamps, LRCName)

@app.post("/uploadfile")
async def main(Req: Request):
    request = await Req.json()

    if request["fileName"] is None or request["fileName"] == "":
        raise HTTPException(status_code=400, detail="File name is required")

    audio_path = "../../uploads" + request["fileName"]
    print(f"Processing the audio file: {audio_path}")

    output_lrc_path = f"../../uploads/lrc{request['fileName'].split('.')[0]}.lrc"

    os.makedirs(os.path.dirname(output_lrc_path), exist_ok=True)

    transcribe_audio(audio_path, output_lrc_path)

    print("Process completed.")

    return {"message": "Audio processed successfully", "lrc_file": f"/lrc{request['fileName'].split('.')[0]}.lrc"}
