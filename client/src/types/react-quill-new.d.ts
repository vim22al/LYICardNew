declare module 'react-quill-new' {
  import React from 'react'

  export interface QuillOptionsStatic {
    modules?: any
    theme?: string
    formats?: string[]
    bounds?: string | HTMLElement
    scrollingContainer?: string | HTMLElement
    readOnly?: boolean
    placeholder?: string
  }

  export interface ReactQuillProps {
    id?: string
    className?: string
    theme?: string
    modules?: any
    formats?: string[]
    value?: string
    defaultValue?: string
    placeholder?: string
    readOnly?: boolean
    onChange?: (content: string, delta: any, source: any, editor: any) => void
    onChangeSelection?: (selection: any, source: any, editor: any) => void
    onFocus?: (range: any, source: any, editor: any) => void
    onBlur?: (previousRange: any, source: any, editor: any) => void
    onKeyPress?: (event: any) => void
    onKeyDown?: (event: any) => void
    onKeyUp?: (event: any) => void
    children?: React.ReactNode
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}
