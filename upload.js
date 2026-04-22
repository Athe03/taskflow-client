import { createUploadthing } from 'uploadthing/server'

const f = createUploadthing()

export const uploadRouter = {
    taskAttachment: f({
        image: { maxFileSize: '4MB', maxFileCount: 1 },
        pdf: { maxFileSize: '8MB', maxFileCount: 1 },
    }).middleware(async ({ req }) => {
        const token = req.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) throw new Error('Non authentifié')
        return { token }
    }).onUploadComplete(async ({ metadata, file }) => {
        console.log('Fichier uploadé:', file.url)
        return { url: file.url, name: file.name }
    }),
}

import { generateUploadButton } from 'uploadthing/react'
export const UploadButton = generateUploadButton({ url: '/api/uploadthing' })