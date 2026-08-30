'use client'

import { forwardRef, useEffect, useMemo, useRef, useImperativeHandle, type ReactNode } from 'react'
import { motion, useAnimate, stagger } from 'framer-motion'
import { cn } from '@/lib/utils'

type TextGenerateEffectProps = {
  words: string
  className?: string
  filter?: boolean
  duration?: number
  staggerDelay?: number
  /** Optional prefix element (e.g. arrow icon) rendered before the words. */
  prefix?: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
}

/**
 * Blur-to-clear text reveal. Each word starts blurred and faded, then resolves
 * in sequence. Works with framer-motion (not motion/react).
 */
export const TextGenerateEffect = forwardRef<HTMLDivElement, TextGenerateEffectProps>(
  function TextGenerateEffect(
    {
      words,
      className,
      filter = true,
      duration = 0.5,
      staggerDelay = 0.15,
      prefix,
      as: Tag = 'h3',
    },
    ref,
  ) {
    const localRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

    const [scope, animate] = useAnimate()
    const wordsArray = useMemo(() => words.split(' '), [words])

    useEffect(() => {
      if (scope.current) {
        animate(
          'span',
          {
            opacity: 1,
            filter: filter ? 'blur(0px)' : 'none',
          },
          {
            duration,
            delay: stagger(staggerDelay),
          },
        )
      }
    }, [animate, duration, filter, scope, staggerDelay])

    return (
      <Tag className={cn('font-bold', className)} ref={localRef}>
        <motion.div ref={scope} className="inline">
          {prefix && <span className="mr-2 inline-block">{prefix}</span>}
          {wordsArray.map((word, idx) => (
            <motion.span
              className="mr-[0.3em] inline-block opacity-0 will-change-[filter,opacity]"
              key={`${word}-${idx}`}
              style={{ filter: filter ? 'blur(10px)' : 'none' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </Tag>
    )
  },
)
