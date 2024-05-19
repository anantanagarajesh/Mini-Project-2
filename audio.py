import os
import pyaudio
import wave

audio = pyaudio.PyAudio()

stream = audio.open(format=pyaudio.paInt16, channels=1, rate=44100, input=True, frames_per_buffer=1024)
frames = []

try:
    while True:
        data = stream.read(1024)
        frames.append(data)
except KeyboardInterrupt:
    pass

stream.stop_stream()
stream.close()
audio.terminate()

output_dir = r"C:\\Users\HARINI N\\Desktop\\Mini-Project-2\\Speaker-Recognition\\train"
output_filename = "myrecording.wav"
output_path = os.path.join(output_dir, output_filename)

sound_file = wave.open(output_path, "wb")
sound_file.setnchannels(1)
sound_file.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
sound_file.setframerate(44100)
sound_file.writeframes(b''.join(frames))
sound_file.close()
