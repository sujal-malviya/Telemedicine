'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react'

export function VideoCall({ roomId }: { roomId: string }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  const createPeerConnection = useCallback(() => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    const peerConnection = new RTCPeerConnection(configuration)
    peerConnectionRef.current = peerConnection

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({ type: 'ice-candidate', candidate: event.candidate })
      }
    }

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    return peerConnection
  }, [roomId])

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }, [])

  const sendSignalingMessage = async (message: any) => {
    await fetch('/api/signaling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, message }),
    })
  }

  const processSignalingMessages = useCallback(async () => {
    const response = await fetch(`/api/signaling?roomId=${roomId}`)
    const data = await response.json()
    for (const message of data.messages) {
      if (message.type === 'offer') {
        await handleOffer(message)
      } else if (message.type === 'answer') {
        await handleAnswer(message)
      } else if (message.type === 'ice-candidate') {
        await handleNewICECandidate(message)
      }
    }
  }, [roomId])

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const peerConnection = createPeerConnection()
    const stream = await startLocalStream()
    stream?.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    sendSignalingMessage({ type: 'answer', answer })
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnectionRef.current
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  const handleNewICECandidate = async (message: { candidate: RTCIceCandidateInit }) => {
    const peerConnection = peerConnectionRef.current
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
      } catch (e) {
        console.error('Error adding received ice candidate', e)
      }
    }
  }

  useEffect(() => {
    const intervalId = setInterval(processSignalingMessages, 1000)
    return () => clearInterval(intervalId)
  }, [processSignalingMessages])

  const startCall = async () => {
    setIsCalling(true)
    const peerConnection = createPeerConnection()
    const stream = await startLocalStream()
    stream?.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    sendSignalingMessage({ type: 'offer', offer })
  }

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsAudioMuted(!isAudioMuted)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    setLocalStream(null)
    setRemoteStream(null)
    setIsCalling(false)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-lg p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-indigo-800">Video Call - Room: {roomId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <h3 className="text-lg font-medium text-indigo-700 mb-2">Local Video</h3>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-auto border-4 border-indigo-300 rounded-xl shadow-md" />
          </div>
          <div className="relative">
            <h3 className="text-lg font-medium text-indigo-700 mb-2">Remote Video</h3>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-auto border-4 border-indigo-300 rounded-xl shadow-md" />
          </div>
        </div>

        <div className="flex justify-center items-center space-x-6">
          {!isCalling ? (
            <Button onClick={startCall} className="bg-indigo-600 text-white hover:bg-indigo-700">
              Start Call
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleAudio}
                variant={isAudioMuted ? "destructive" : "default"}
                className="transition duration-300"
              >
                {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "default"}
                className="transition duration-300"
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button
                onClick={endCall}
                variant="destructive"
                className="transition duration-300"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
