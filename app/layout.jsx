import './globals.css'

export const metadata = {
    title: 'WeaveIQ — Engineering Intelligence',
    description: 'ML-powered engineering productivity analyzer'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}