"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import BrutalButton from "../ButtonComponent/ButtonComponent";
import { BrutalInput } from "../InputComponent/InputComponent";
import { useTranslation } from "react-i18next";

interface SubmitOptions {
  prompt?: string;
}

interface AudioMetadataRecorderProps {
  onSubmit: (audioFile: File, options?: SubmitOptions) => Promise<void>;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export const AudioMetadataRecorder: React.FC<AudioMetadataRecorderProps> = ({
  onSubmit,
  disabled = false,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioUrl]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  const handleStartRecording = useCallback(async () => {
    if (disabled || isSubmitting) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        t("processing.audio.notSupported", {
          defaultValue:
            "Audio recording is not supported in this browser. Please upload a file instead.",
        })
      );
      return;
    }

    try {
      setError(null);
      resetRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType =
          recorder.mimeType ||
          (chunksRef.current[0]?.type ?? "audio/webm;codecs=opus");
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (recordError) {
      console.error("Error starting audio recording:", recordError);
      setError(
        t("processing.audio.permissionError", {
          defaultValue:
            "We could not access the microphone. Please check your permissions and try again.",
        })
      );
    }
  }, [disabled, isSubmitting, resetRecording, t]);

  const handleStopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!audioBlob || disabled || isSubmitting) return;

    try {
      setError(null);
      const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const audioFile = new File([audioBlob], `voice-input.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });
      await onSubmit(audioFile, {
        prompt: promptValue.trim() || undefined,
      });
    } catch (submitError) {
      console.error("Error submitting audio metadata:", submitError);
      setError(
        t("processing.audio.submitError", {
          defaultValue:
            "There was a problem sending the audio. Please try again.",
        })
      );
    }
  }, [audioBlob, disabled, isSubmitting, onSubmit, promptValue, t]);

  return (
    <div className="border-4 border-black rounded-lg p-4 bg-white space-y-3">
      <h3 className="text-lg font-bold">
        {t("processing.audio.voiceMetadataTitle", {
          defaultValue: "Voice input metadata",
        })}
      </h3>
      <p className="text-sm text-gray-600">
        {t("processing.audio.voiceMetadataHelper", {
          defaultValue:
            "Record an audio note describing the asset. We will send it together with the current metadata JSON.",
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        {!isRecording && (
          <BrutalButton
            onClick={handleStartRecording}
            disabled={disabled || isSubmitting}
            variant="blue"
          >
            {t("processing.audio.startRecording", {
              defaultValue: "Start recording",
            })}
          </BrutalButton>
        )}
        {isRecording && (
          <BrutalButton onClick={handleStopRecording} variant="red">
            {t("processing.audio.stopRecording", {
              defaultValue: "Stop",
            })}
          </BrutalButton>
        )}
        {audioBlob && !isRecording && (
          <BrutalButton onClick={resetRecording} variant="yellow">
            {t("processing.audio.recordAgain", {
              defaultValue: "Discard recording",
            })}
          </BrutalButton>
        )}
      </div>

      {audioUrl && (
        <audio
          src={audioUrl}
          controls
          className="w-full border-2 border-black rounded-lg"
        />
      )}

      <BrutalInput
        label={t("processing.audio.promptLabel", {
          defaultValue: "Optional prompt for the assistant",
        })}
        multiline
        value={promptValue}
        onChange={(event) => setPromptValue(event.target.value)}
        placeholder={t("processing.audio.promptPlaceholder", {
          defaultValue:
            "Add any extra instructions you want to include. Leave empty to use defaults.",
        })}
        className="w-full"
      />

      <BrutalButton
        onClick={handleSubmit}
        disabled={!audioBlob || disabled || isSubmitting}
        variant="green"
      >
        {isSubmitting
          ? t("general.loading")
          : t("processing.audio.submitRecording", {
              defaultValue: "Send audio & metadata",
            })}
      </BrutalButton>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AudioMetadataRecorder;
