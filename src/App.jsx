import { useEffect, useRef, useState } from 'react'
import './App.css'

const INTRO_EXIT_MS = 420
const LETTER_MOVE_MS = 560
const ENVELOPE_OPEN_MS = 880

const letters = [
  {
    id: '01',
    badge: 'Bức thư 01',
    title: 'Bố m đẳng cấp',
    excerpt:
      'Bạn cũng tạm ',
    signature: 'mấy con gà biết đéo gì',
    accent: '#bf5f71',
    tilt: '-4deg',
    delay: '0ms',
    floatDuration: '6.2s',
    floatShift: '-8px',
    floatTwist: '1deg',
  },
  {
    id: '02',
    badge: 'Bức thư 02',
    title: 'điếu thuốc tàn t nhặt lên hút lại',
    excerpt:
      'bạn như l t đéo cần lần hai',
    signature: 'đẳng cấp là mãi mãi',
    accent: '#d59a4b',
    tilt: '3deg',
    delay: '120ms',
    floatDuration: '5.8s',
    floatShift: '-10px',
    floatTwist: '-1.1deg',
  },
  {
    id: '03',
    badge: 'Bức thư 03',
    title: 'Nếu cả đời không rực rỡ thì sao',
    excerpt:
      'thì nhìn thằng bố m đây ',
    signature: 'đứa nào cũng rực rỡ thì mù mắt cả lũ à',
    accent: '#7c8f73',
    tilt: '-2deg',
    delay: '240ms',
    floatDuration: '6.6s',
    floatShift: '-7px',
    floatTwist: '0.8deg',
  },
  {
    id: '04',
    badge: 'Bức thư 04',
    title: 'Hỡi em giữa muôn trùng vạn thế',
    excerpt:
      'đi một vòng rồi có về với nhau?',
    signature: ' công bằng cho anh JACK',
    accent: '#c77759',
    tilt: '4deg',
    delay: '360ms',
    floatDuration: '5.5s',
    floatShift: '-9px',
    floatTwist: '-1deg',
  },
  {
    id: '05',
    badge: 'Bức thư 05',
    title: 'Cảm ơn người đã tìm đến tôi',
    excerpt:
      'rồi rời đi sau muôn ngàn nuối tiếc',
    signature: 'tiếc cho bạn th chứ đẳng cấp như bố tiếc đ gì ai',
    accent: '#9a67b3',
    tilt: '-3deg',
    delay: '480ms',
    floatDuration: '6.9s',
    floatShift: '-8px',
    floatTwist: '1.1deg',
  },
]

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
      <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.08 1.09-1.27 2.76-2.08 4.5-2.08 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
    </svg>
  )
}

function App() {
  const [phase, setPhase] = useState('idle')
  const [activeLetterId, setActiveLetterId] = useState(null)
  const [readerPhase, setReaderPhase] = useState('hidden')
  const [motionOrigin, setMotionOrigin] = useState({ x: '0px', y: '0px' })
  const introTimerRef = useRef(null)
  const readerTimersRef = useRef([])
  const previewRefs = useRef({})

  const clearReaderTimers = () => {
    readerTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    readerTimersRef.current = []
  }

  useEffect(() => {
    return () => {
      if (introTimerRef.current) {
        window.clearTimeout(introTimerRef.current)
      }

      clearReaderTimers()
    }
  }, [])

  useEffect(() => {
    if (!activeLetterId) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        clearReaderTimers()
        setReaderPhase('hidden')
        setActiveLetterId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [activeLetterId])

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scheduleReaderStep = (callback, delay) => {
    const timerId = window.setTimeout(() => {
      callback()
      readerTimersRef.current = readerTimersRef.current.filter(
        (item) => item !== timerId,
      )
    }, delay)

    readerTimersRef.current.push(timerId)
  }

  const handleOpen = () => {
    if (phase !== 'idle') {
      return
    }

    setPhase('exiting')

    const exitDelay = prefersReducedMotion() ? 0 : INTRO_EXIT_MS

    introTimerRef.current = window.setTimeout(() => {
      setPhase('revealed')
      introTimerRef.current = null
    }, exitDelay)
  }

  const handleSelectLetter = (letterId) => {
    if (phase !== 'revealed' || activeLetterId) {
      return
    }

    const reducedMotion = prefersReducedMotion()
    const previewElement = previewRefs.current[letterId]

    if (previewElement) {
      const rect = previewElement.getBoundingClientRect()
      const deltaX = rect.left + rect.width / 2 - window.innerWidth / 2
      const deltaY = rect.top + rect.height / 2 - window.innerHeight / 2

      setMotionOrigin({
        x: `${deltaX}px`,
        y: `${deltaY}px`,
      })
    } else {
      setMotionOrigin({ x: '0px', y: '0px' })
    }

    clearReaderTimers()
    setActiveLetterId(letterId)

    if (reducedMotion) {
      setReaderPhase('opened')
      return
    }

    setReaderPhase('moving')
    scheduleReaderStep(() => setReaderPhase('opening'), LETTER_MOVE_MS)
    scheduleReaderStep(
      () => setReaderPhase('opened'),
      LETTER_MOVE_MS + ENVELOPE_OPEN_MS,
    )
  }

  const handleCloseLetter = () => {
    clearReaderTimers()
    setReaderPhase('hidden')
    setActiveLetterId(null)
  }

  const activeLetter = letters.find((letter) => letter.id === activeLetterId)
  const isIdle = phase === 'idle'
  const isExiting = phase === 'exiting'
  const isRevealed = phase === 'revealed'

  return (
    <main className={`tribute-app phase-${phase}`}>
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <div className="ambient ambient--three" aria-hidden="true" />

      <section
        className={`intro-panel ${isRevealed ? 'is-hidden' : 'is-visible'}`}
      >
        <button
          type="button"
          className={`love-trigger ${isExiting ? 'is-exiting' : ''}`}
          onClick={handleOpen}
          disabled={!isIdle}
          aria-label="Nhấn vào trái tim để nhận lời yêu thương"
        >
          <span className="love-trigger__icon">
            <HeartIcon />
          </span>
          <span className="love-trigger__label">
            Nhấn vào trái tim để nhận lời yêu thương...
          </span>
        </button>
      </section>

      <section
        className={`letters-stage ${isRevealed ? 'is-visible' : ''} ${
          activeLetterId ? 'has-selected' : ''
        }`}
        aria-label="Năm phong bì tri ân"
      >
        {letters.map((letter) => {
          const isActive = activeLetterId === letter.id

          return (
            <div
              key={letter.id}
              className={`letter-shell ${isActive ? 'is-active' : ''}`}
              style={{
                '--delay': letter.delay,
                '--float-duration': letter.floatDuration,
                '--float-shift': letter.floatShift,
                '--float-twist': letter.floatTwist,
                '--accent': letter.accent,
                '--tilt': letter.tilt,
              }}
            >
              <button
                ref={(node) => {
                  previewRefs.current[letter.id] = node
                }}
                type="button"
                className="letter-preview"
                onClick={() => handleSelectLetter(letter.id)}
                disabled={Boolean(activeLetterId)}
                aria-label={`Mở thư: ${letter.title}`}
              >
                <span className="letter-preview__seal" aria-hidden="true" />
                <span className="letter-preview__hint">Nhấn để mở thư</span>
              </button>
            </div>
          )
        })}
      </section>

      {activeLetter && (
        <section
          className={`letter-reader is-visible phase-${readerPhase}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`letter-title-${activeLetter.id}`}
        >
          <button
            type="button"
            className="letter-reader__backdrop"
            onClick={handleCloseLetter}
            aria-label="Đóng thư đang đọc"
          />

          <div
            className="letter-reader__dialog"
            style={{
              '--origin-x': motionOrigin.x,
              '--origin-y': motionOrigin.y,
              '--accent': activeLetter.accent,
            }}
          >
            <button
              type="button"
              className="letter-reader__close"
              onClick={handleCloseLetter}
              aria-label="Đóng thư"
            >
              Nhấn để quay lại
            </button>

            <div className="reader-envelope">
              <div className="reader-envelope__back" />

              <div className="reader-paper">
                <h2 id={`letter-title-${activeLetter.id}`}>{activeLetter.title}</h2>
                <p>{activeLetter.excerpt}</p>
                <p className="reader-paper__signature">{activeLetter.signature}</p>
              </div>

              <div className="reader-envelope__front" />
              <div className="reader-envelope__flap" />
              <span className="reader-envelope__seal" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
