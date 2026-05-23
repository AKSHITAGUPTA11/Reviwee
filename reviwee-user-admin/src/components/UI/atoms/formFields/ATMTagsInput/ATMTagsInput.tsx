import React, { useState, useRef, useEffect } from 'react'
import ATMFormLabel from "../ATMFormLabel";

export interface ATMTagsInputPropTypes {
    tags: any[]
    setTags: ((value: any[]) => void);
    max?: number;
    renderTag?: (tag: any, removeTag: any) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    size?: 'small' | 'medium' | 'large';
    /** When true, Space also adds new tag. When false, only Enter adds (allows multi-word tags). Default: true */
    addOnSpace?: boolean;
    placeholder?: string;
    /** Max height (px) for textarea before scroll. Default: 120 */
    maxTextareaHeight?: number;
    /** Max height (px) for entire field before scroll. Default: 150 */
    maxContainerHeight?: number;
}

const ATMTagsInput = ({
    tags,
    setTags,
    max = Infinity,
    renderTag,
    label,
    required = false,
    disabled = false,
    readonly = false,
    addOnSpace = true,
    placeholder,
    maxTextareaHeight = 120,
    maxContainerHeight = 150,
}: ATMTagsInputPropTypes
) => {

    const [currentTagText, setCurrentTagText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        const newHeight = Math.min(ta.scrollHeight, maxTextareaHeight);
        ta.style.height = `${newHeight}px`;
        ta.style.overflowY = ta.scrollHeight > maxTextareaHeight ? 'auto' : 'hidden';
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [currentTagText]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (tags.length < max) {
            setCurrentTagText(e.target.value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const text = (e.target as HTMLTextAreaElement).value;
        if (e.keyCode === 13 && text.trim() && tags.length < max) {
            e.preventDefault();
            setTags([...tags, text.trim()]);
            setCurrentTagText("");
        } else if (addOnSpace && e.keyCode === 32 && text.trim() && tags.length < max) {
            e.preventDefault();
            setTags([...tags, text.trim()]);
            setCurrentTagText("");
        }
    };
    const removeTag = (index: any) => {
        const newTagArray = tags;
        newTagArray.splice(index, 1);
        setTags([...newTagArray]);
    };


    return (
        <>
            <ATMFormLabel label={label} required={required} extraClasses="text-slate-500" />
            <div
                className={`min-h-[42px] flex flex-wrap gap-2 border border-(--divider) rounded(--radius-sm) p-2 overflow-y-auto overflow-x-hidden w-full items-start ${label ? 'mt-2' : ''} ${disabled && 'opacity-60'}`}
                style={{ maxHeight: maxContainerHeight }}
            >
                {
                    tags.map((tag, index) => (
                        <React.Fragment key={index} >
                            <>
                                {

                                    renderTag ? renderTag(tag, () => { !disabled && !readonly && removeTag(index) })
                                        :
                                        <div className='flex gap-3 items-center rounded-full bg-slate-300 p-1 px-2 text-sm h-[25px]'>
                                            <div>
                                                {tag}
                                            </div>
                                            <div
                                                onClick={() => !disabled && !readonly && removeTag(index)}
                                                className={`${!disabled && !readonly && 'cursor-pointer'} h-[20px] w-[20px] flex justify-center items-center rounded-full bg-slate-100`}
                                            >
                                                x
                                            </div>
                                        </div >
                                }

                            </>
                        </React.Fragment>
                    ))
                }

                {
                    !disabled && !readonly &&
                    <div className='flex flex-auto min-w-[80px] w-full' >
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className='border-none outline-none flex-1 w-full resize-none overflow-hidden py-1 px-0 text-sm leading-[1.4] min-h-[24px]'
                            style={{ maxHeight: maxTextareaHeight }}
                            onKeyDown={handleKeyDown}
                            onChange={handleChange}
                            value={currentTagText}
                            readOnly={readonly}
                            disabled={disabled}
                            placeholder={placeholder}
                        />
                    </div>
                }
            </div >
        </>


    )
}

export default ATMTagsInput
