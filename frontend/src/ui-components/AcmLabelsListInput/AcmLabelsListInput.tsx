/* Copyright Contributors to the Open Cluster Management project */

import { FormGroup, Label, TextInput } from '@patternfly/react-core'
import { Fragment, useState, useRef } from 'react'
import { useValidationContext } from '../AcmForm/AcmForm'

export function AcmLabelsListInput(props: {
  id: string
  label: string
  value: string | undefined
  onChange: (labels: string[] | undefined) => void
  buttonLabel: string
  hidden?: boolean
  placeholder?: string
  isDisabled?: boolean
}) {
  const [inputValue, setInputValue] = useState<string>()
  const ValidationContext = useValidationContext()
  const inputRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null)

  const { value: valueString } = props
  const value = valueString?.split(',')

  function addLabel(input: string) {
    const filteredInput = input
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag != '')

    /* istanbul ignore next */
    const newLabels = value || []

    filteredInput.forEach((finput) => {
      if (!newLabels.includes(finput)) {
        newLabels.push(finput)
        props.onChange(newLabels)
      }
    })
  }

  function removeLabel(removedLabel: string) {
    /* istanbul ignore next */
    let newLabels = value?.filter((label) => label != removedLabel)
    if (newLabels && newLabels.length == 0) newLabels = undefined
    props.onChange(newLabels)
  }

  return (
    <Fragment>
      <FormGroup id={`${props.id}-label`} label={props.label} fieldId={props.id} hidden={props.hidden}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          id="label-input-button"
          className="pf-c-form-control"
          style={{
            padding: 0,
            paddingTop: '1px',
            display: 'flex',
            alignItems: 'start',
            flexWrap: 'wrap',
            height: 'unset',
            minHeight: '36px',
            borderBottom: 'none',
          }}
          onClick={() => {
            setInputValue(undefined)
            /* istanbul ignore next */
            inputRef.current?.focus()
          }}
        >
          {value &&
            value.map((key) => (
              <Label
                className="label-pill"
                key={key}
                style={{ margin: 2 }}
                onClose={(e) => {
                  removeLabel(key)
                  /* istanbul ignore next */
                  e.detail === 0 && inputRef.current?.focus() // only refocus on keyboard event, detail is 0 on key event
                }}
                closeBtnProps={{ id: `remove-${key}` }}
              >
                {key}
              </Label>
            ))}
          <TextInput
            ref={inputRef}
            style={{
              marginTop: '1px',
              borderTop: 'none',
              borderLeft: 'none',
              marginLeft: 0,
            }}
            id={props.id}
            placeholder={props.placeholder}
            isDisabled={/* istanbul ignore next */ props.isDisabled || ValidationContext.isReadOnly}
            onChange={(value) => {
              setInputValue(value)
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case ',':
                case 'Enter':
                  {
                    e.preventDefault()
                    e.stopPropagation()
                    // istanbul ignore else
                    if (inputValue) {
                      addLabel(inputValue)
                    }
                    const inputElement = e.target as HTMLInputElement
                    setInputValue('')
                    inputElement.value = ''
                    setTimeout(() => (inputElement.value = ''), 0)
                  }
                  break
                case 'Backspace':
                  /* istanbul ignore else */
                  if (!inputValue) {
                    const labels = document.querySelectorAll('.label-pill button') as unknown as HTMLButtonElement[]
                    /* istanbul ignore else */
                    if (labels && labels.length > 0) {
                      labels[labels.length - 1].focus()
                    }
                  }
                  break
              }
            }}
            onBlur={
              /* istanbul ignore next */
              (e) => addLabel(e.target.value)
            }
          />
        </div>
      </FormGroup>
    </Fragment>
  )
}
