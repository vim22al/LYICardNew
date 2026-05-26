import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ScanLine, Upload, Camera, X, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useState, useCallback } from 'react'
import { useScanCardMutation } from '@/hooks/useContactHooks'
import Webcam from 'react-webcam'

export const Route = createFileRoute('/_app/scan')({
  component: ScanPage,
})

function ScanPage() {
  const navigate = useNavigate()
  const scanMutation = useScanCardMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    await uploadImage(file)
  }

  const uploadImage = async (file: File | Blob) => {
    const formData = new FormData()
    formData.append('image', file, 'scan.jpg')

    try {
      const result = await scanMutation.mutateAsync(formData)
      // Transition to review page
      navigate({
        to: '/extracted/$contactId',
        params: { contactId: result.contactId },
      })
    } catch (err: any) {
      // Error handled by Toast in mutation hook
      setIsCameraActive(false)
      setCapturedImage(null)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  const retake = () => {
    setCapturedImage(null)
  }

  const confirmCapture = async () => {
    if (!capturedImage) return

    // Convert base64 to blob
    const res = await fetch(capturedImage)
    const blob = await res.blob()
    await uploadImage(blob)
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  // Loading State
  if (scanMutation.isPending) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-32 w-32 rounded-full border-4 border-lagoon/20 border-t-lagoon animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine className="h-12 w-12 text-lagoon animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-sm">
          <h2 className="text-3xl font-black text-foreground font-sans uppercase tracking-tight">
            Processing Card
          </h2>
          <p className="text-muted-foreground font-sans text-lg">
            Our AI is currently reading the details from the card. This will
            just take a second...
          </p>
        </div>
      </div>
    )
  }

  // Camera Overlay
  if (isCameraActive) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-full duration-500">
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-lagoon/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-lagoon" />
            </div>
            <div>
              <h2 className="font-black text-foreground uppercase tracking-wider">
                Live Scanner
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Position the card within the frame
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsCameraActive(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full aspect-[16/10] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-black/50">
            {!capturedImage ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: 'environment' }}
                />
                {/* Guide Overlay */}
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                  <div className="w-full h-full border-2 border-white/50 rounded-2xl border-dashed relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/20" />
                    <div className="absolute top-4 left-4 h-8 w-8 border-t-4 border-l-4 border-lagoon rounded-tl-xl" />
                    <div className="absolute top-4 right-4 h-8 w-8 border-t-4 border-r-4 border-lagoon rounded-tr-xl" />
                    <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-lagoon rounded-bl-xl" />
                    <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-lagoon rounded-br-xl" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={capturedImage}
                className="w-full h-full object-cover"
                alt="Captured Card"
              />
            )}
          </div>
        </div>

        <div className="p-10 bg-card/50 border-t border-border flex items-center justify-center gap-6">
          {!capturedImage ? (
            <Button
              size="lg"
              onClick={capture}
              className="h-20 w-20 rounded-full bg-lagoon hover:bg-lagoon-deep text-white shadow-xl shadow-lagoon/20 group p-0"
            >
              <div className="h-14 w-14 rounded-full border-4 border-white/30 flex items-center justify-center group-active:scale-95 transition-transform">
                <div className="h-8 w-8 rounded-full bg-white animate-pulse" />
              </div>
            </Button>
          ) : (
            <div className="flex items-center gap-6 animate-in zoom-in duration-300">
              <Button
                variant="outline"
                size="lg"
                onClick={retake}
                className="rounded-2xl gap-2 h-14 px-8 border-border hover:bg-muted"
              >
                <RefreshCw className="h-5 w-5" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={confirmCapture}
                className="rounded-2xl gap-2 h-14 px-10 bg-lagoon hover:bg-lagoon-deep text-white shadow-lg shadow-lagoon/20"
              >
                <Check className="h-5 w-5" />
                Analyze Card
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight text-foreground font-sans uppercase">
          Capture <span className="text-lagoon">Card</span>
        </h1>
        <p className="text-xl text-muted-foreground font-sans max-w-xl mx-auto">
          Choose your scanning method. Our AI extraction works instantly with
          both uploads and live captures.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Upload Card */}
        <div
          onClick={triggerUpload}
          className="group relative bg-card p-12 rounded-[2.5rem] border-2 border-dashed border-lagoon/20 hover:border-lagoon hover:bg-lagoon/5 transition-all flex flex-col items-center text-center cursor-pointer shadow-xl shadow-transparent hover:shadow-lagoon/5"
        >
          <div className="h-24 w-24 rounded-[2rem] bg-lagoon/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Upload className="h-12 w-12 text-lagoon" />
          </div>
          <h3 className="text-2xl font-black text-foreground font-sans uppercase tracking-tight">
            Import Local
          </h3>
          <p className="text-muted-foreground font-sans mt-3 text-sm leading-relaxed max-w-[240px]">
            Have an image already? Select from your device or drag and drop.
          </p>
          <Button
            variant="outline"
            className="mt-8 border-lagoon text-lagoon hover:bg-lagoon hover:text-white rounded-2xl px-10 h-12 font-bold transition-all border-2"
          >
            Browse Files
          </Button>
        </div>

        {/* Camera Card */}
        <div
          onClick={() => setIsCameraActive(true)}
          className="group relative bg-[#173a40] text-white p-12 rounded-[2.5rem] flex flex-col items-center text-center cursor-pointer shadow-2xl shadow-[#173a40]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Camera className="h-32 w-32 -mr-8 -mt-8" />
          </div>
          <div className="h-24 w-24 rounded-[2rem] bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10">
            <Camera className="h-12 w-12 text-lagoon" />
          </div>
          <h3 className="text-2xl font-black font-sans uppercase tracking-tight relative z-10">
            Live Scan
          </h3>
          <p className="text-white/60 font-sans mt-3 text-sm leading-relaxed max-w-[240px] relative z-10">
            Use your device camera to snap a photo and extract details
            instantly.
          </p>
          <Button className="mt-8 bg-lagoon hover:bg-lagoon-deep text-white rounded-2xl px-10 h-12 font-bold shadow-lg shadow-black/20 transition-all border-none relative z-10">
            Snap Photo
          </Button>
        </div>
      </div>

      {/* Tip Section */}
      <div className="bg-card/50 backdrop-blur-sm p-8 rounded-[2rem] border border-border flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-lagoon to-lagoon-deep flex items-center justify-center shrink-0 shadow-lg text-white">
          <ScanLine className="h-7 w-7" />
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-black text-foreground text-lg uppercase tracking-tight font-sans">
            AI Power Extraction
          </h4>
          <p className="text-muted-foreground font-sans mt-1 leading-relaxed">
            Our neural network analyzes the image in real-time. For the most
            accurate extraction, keep the card flat, avoid glare, and ensure the
            text is within the bounding box corners.
          </p>
        </div>
      </div>
    </div>
  )
}
