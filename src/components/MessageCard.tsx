interface Props {
  content: string
}

export default function MessageCard({ content }: Props) {
  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h2 className="font-semibold mb-2">Mensagem Gerada:</h2>
      <p className="whitespace-pre-line text-gray-700">{content}</p>
    </div>
  )
}
