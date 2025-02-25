import { FC, useEffect, useState } from 'react'
import avatar from '../assets/avatar.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { useForm } from 'react-hook-form'

interface formData {
    email: string,
    password: string,
    img: File[]
};

const RegistrationForm: FC = () => {
    const [file, setFile] = useState<File | null>(null)
    // const inputFileRef = useRef<HTMLInputElement>(null)
    const { register, handleSubmit, watch } = useForm<formData>();
    const [img] = watch(['img'])
    const inputFileRef: { current: HTMLInputElement | null } = { current: null }

    useEffect(() => {
        console.log("useEffect")
        if (img) {
            console.log(img)
            setFile(img[0])
        }
    }, [img]);

    const onSubmit = (data: formData) => {
        console.log("formData:", data)
    }
    const { ref, ...rest } = register("img");
    return (
        <form style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
            onSubmit={handleSubmit(onSubmit)}>
            <div className='d-flex flex-column' style={{ width: '50%', backgroundColor: "lightgray", padding: '20px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <img src={file ? URL.createObjectURL(file) : avatar} style={{ width: '200px', height: '200px', alignSelf: 'center' }} />
                    <FontAwesomeIcon onClick={() => { inputFileRef.current?.click() }} icon={faImage} className="fa-xl" style={{ position: 'absolute', bottom: '0', right: '0' }} />
                </div>
                <input {...rest} ref={(e) => { ref(e); inputFileRef.current = e }} type="file" className='mb-3' accept='image/jpeg, image/png'
                    style={{ display: 'none' }}
                />
                <label >email:</label>
                <input {...register("email")} type="text" className='mb-3' />
                <label >password:</label>
                <input {...register("password")} type="password" className='mb-3' />
                <button type='submit' className='btn btn-outline-primary'>Register</button>
            </div>
        </form >
    )
}

export default RegistrationForm