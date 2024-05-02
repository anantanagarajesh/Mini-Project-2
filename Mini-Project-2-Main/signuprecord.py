import pyaudio
import wave
import time

audio = pyaudio.PyAudio()

stream = audio.open(format=pyaudio.paInt16, channels=1, rate=44100, input=True, frames_per_buffer=1024)
frames = []
timeout = 5  # Set the recording duration to 5 seconds

try:
    start_time = time.time()  # Record the start time
    while time.time() - start_time < timeout:
        data = stream.read(1024)
        frames.append(data)
except KeyboardInterrupt:
    pass

stream.stop_stream()
stream.close()
audio.terminate()

sound_file = wave.open("C:\\Users\\JAYANTH\\Desktop\\Speaker-Recognition-master\\train\\s1.wav", "wb")
sound_file.setnchannels(1)
sound_file.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
sound_file.setframerate(44100)
sound_file.writeframes(b''.join(frames))
sound_file.close()
