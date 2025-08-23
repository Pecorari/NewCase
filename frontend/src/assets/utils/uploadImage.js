import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadImage(file) {
  if (!file) return null;

  const imageRef = ref(storage, `produtos/${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);

  return url;
}

// import React, { useState } from 'react';
// import { uploadImage } from '../utils/uploadImage';

// function UploadForm() {
//   const [file, setFile] = useState(null);

//   const handleUpload = async () => {
//     const url = await uploadImage(file);
//     console.log('Imagem enviada, URL:', url);
//     // Aqui você pode salvar essa URL no backend com o nome, preço, etc.
//   };

//   return (
//     <div>
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleUpload}>Enviar Imagem</button>
//     </div>
//   );
// }
