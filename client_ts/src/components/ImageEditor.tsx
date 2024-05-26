import React, { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from '@mui/material';

interface ImageEditorProps {
    onSave: (croppedImage: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onSave }) => {
    const [image, setImage] = useState<string | null>(null);
    const [cropper, setCropper] = useState<Cropper>();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files = e.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const onCrop = () => {
        if (cropper) {
            const croppedImage = cropper.getCroppedCanvas().toDataURL();
            onSave(croppedImage);
        }
    };

    return (
        <div>
            <input type="file" onChange={onChange} accept="image/*" />
            {image && (
                <Cropper
                    src={image}
                    style={{ height: 400, width: '100%' }}
                    aspectRatio={1}
                    guides={false}
                    crop={onCrop} // 'crop' イベントハンドラを追加
                    onInitialized={(instance) => setCropper(instance)}
                />
            )}
            <Button onClick={onCrop} variant="contained" color="primary">
                Save
            </Button>
        </div>
    );
};

export default ImageEditor;
