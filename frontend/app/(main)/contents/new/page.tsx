import ContentForm from '../../_components/content-form'

export default function NewContentPage() {
  return (
    <main className="container mx-auto p-6 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">콘텐츠 등록</h1>
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/40">
        <ContentForm />
      </div>
    </main>
  )
}
