'use client'

import * as React from 'react'
import { type HTMLMotionProps, MotionConfig, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Hover slider: a list of words that roll over letter by letter when one is
 * pointed at (or focused), driving a stack of images that wipe in with a clip
 * path.
 *
 * Adapted from the 21st.dev "animated slideshow" block. It imports from
 * framer-motion, which this project already ships, rather than the separate
 * `motion` package — the API is the same, and it saves a second copy of the
 * library. The split letters are hidden from assistive tech; give the
 * surrounding link an accessible name instead.
 */

type HoverSliderContextValue = {
  activeSlide: number
  changeSlide: (index: number) => void
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | undefined>(undefined)

function useHoverSliderContext() {
  const context = React.useContext(HoverSliderContext)
  if (context === undefined) {
    throw new Error('useHoverSliderContext must be used within a HoverSlider')
  }
  return context
}

function splitText(text: string) {
  const words = text.split(' ').map((word) => word.concat(' '))
  const characters = words.map((word) => word.split('')).flat(1)
  return { words, characters }
}

export const HoverSlider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { initial?: number; onSlideChange?: (index: number) => void }
>(({ children, className, initial = 0, onSlideChange, ...props }, ref) => {
  const [activeSlide, setActiveSlide] = React.useState<number>(initial)
  const changeSlide = React.useCallback(
    (index: number) => {
      setActiveSlide(index)
      onSlideChange?.(index)
    },
    [onSlideChange],
  )
  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </HoverSliderContext.Provider>
  )
})
HoverSlider.displayName = 'HoverSlider'

/** Whether `index` is the slide currently shown. */
export function useIsActiveSlide(index: number) {
  return useHoverSliderContext().activeSlide === index
}

/** Makes any element select a slide on hover or focus. */
export function useSlideTrigger(index: number) {
  const { changeSlide } = useHoverSliderContext()
  return {
    onMouseEnter: () => changeSlide(index),
    onFocus: () => changeSlide(index),
  }
}

export const TextStaggerHover = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { text: string; index: number }
>(({ text, index, className, ...props }, ref) => {
  const { activeSlide, changeSlide } = useHoverSliderContext()
  const { characters } = splitText(text)
  const isActive = activeSlide === index

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn('relative inline-block origin-bottom overflow-hidden', className)}
      onMouseEnter={() => changeSlide(index)}
      {...props}
    >
      {characters.map((char, i) => (
        <span key={`${char}-${i}`} className="relative inline-block overflow-hidden">
          <MotionConfig
            transition={{ delay: i * 0.022, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.span
              className="inline-block opacity-35"
              initial={{ y: '0%' }}
              animate={isActive ? { y: '-110%' } : { y: '0%' }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 inline-block opacity-100"
              initial={{ y: '110%' }}
              animate={isActive ? { y: '0%' } : { y: '110%' }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          </MotionConfig>
        </span>
      ))}
    </span>
  )
})
TextStaggerHover.displayName = 'TextStaggerHover'

export const clipPathVariants = {
  visible: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
  hidden: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' },
}

export const HoverSliderImageWrap = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid overflow-hidden [&>*]:col-start-1 [&>*]:col-end-1 [&>*]:row-start-1 [&>*]:row-end-1 [&>*]:size-full',
        className,
      )}
      {...props}
    />
  ),
)
HoverSliderImageWrap.displayName = 'HoverSliderImageWrap'

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<'img'> & { index: number; imageUrl: string }
>(({ index, imageUrl, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext()
  return (
    <motion.img
      ref={ref}
      src={imageUrl}
      className={cn('inline-block align-middle', className)}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      initial={activeSlide === index ? 'visible' : 'hidden'}
      animate={activeSlide === index ? 'visible' : 'hidden'}
      {...props}
    />
  )
})
HoverSliderImage.displayName = 'HoverSliderImage'
