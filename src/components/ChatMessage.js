import React, { useState } from 'react'
import { MdComputer, MdPersonOutline } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import { format } from 'timeago.js';
import CodeCopyBtn from './CodeCopyBtn';
import TypeWriterEffect from 'react-typewriter-effect';
// import Image from './Image'

/**
 * A chat message component that displays a message with a timestamp and an icon.
 *
 * @param {Object} props - The properties for the component.
 */
const ChatMessage = (props) => {
  const { id, createdAt, text, ai = false } = props.message;

  const Pre = ({ children }) => <pre className="blog-pre">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
  </pre>

  return (
    <div key={id} className={`${ai && 'flex-row-reverse'} message`}>
      <div className='message__wrapper'>
        <ReactMarkdown
          children={text}
          className={`message__markdown ${ai ? 'text-left' : 'text-right'}`}
          linkTarget='_blank'
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            pre: Pre,
            code({ node, inline, className = "blog-code", children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  wrapLongLines={true}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                    {children}
                </code>
              )
            }
          }}
        />
        <div className={`${ai ? 'text-left' : 'text-right'} message__createdAt`}>{format(createdAt)}</div>
      </div>

      <div className="message__pic">
        {
          ai ? <MdComputer /> :
          <MdPersonOutline />
        }
      </div>
    </div>
  )
}

export default ChatMessage