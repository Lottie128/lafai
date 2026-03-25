import { useState } from 'react'
import { useStore } from '../../context/StoreContext.jsx'
import { Save, Plus, Trash2, Check, Github } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="bg-card border border-white/5 p-6 mb-6">
      <h3 className="text-xs uppercase tracking-widest text-[#f5f0f2]/40 mb-5 pb-3 border-b border-white/5">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-[#f5f0f2]/50 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function AdminContent() {
  const { content, updateContent } = useStore()
  const [form, setForm] = useState(JSON.parse(JSON.stringify(content)))
  const [saved, setSaved] = useState(false)
  const [ghStatus, setGhStatus] = useState(null)

  const update = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSave = () => {
    updateContent(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const updateFaq = (index, field, value) => {
    const faqs = [...(form.faq || [])]
    faqs[index] = { ...faqs[index], [field]: value }
    setForm((prev) => ({ ...prev, faq: faqs }))
  }

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faq: [...(prev.faq || []), { q: '', a: '' }],
    }))
  }

  const removeFaq = (index) => {
    setForm((prev) => ({
      ...prev,
      faq: (prev.faq || []).filter((_, i) => i !== index),
    }))
  }

  const updateNavLink = (index, field, value) => {
    const links = [...(form.nav?.links || [])]
    links[index] = { ...links[index], [field]: value }
    setForm((prev) => ({ ...prev, nav: { ...prev.nav, links } }))
  }

  const updateValue = (index, field, value) => {
    const values = [...(form.about?.values || [])]
    values[index] = { ...values[index], [field]: value }
    setForm((prev) => ({ ...prev, about: { ...prev.about, values } }))
  }

  const handleGitHubPush = async () => {
    const token = localStorage.getItem('lafai_gh_token')
    const owner = localStorage.getItem('lafai_gh_owner')
    const repo = localStorage.getItem('lafai_gh_repo')

    if (!token || !owner || !repo) {
      setGhStatus({ type: 'error', msg: 'GitHub credentials not set. Go to Settings → GitHub Integration.' })
      return
    }

    setGhStatus({ type: 'loading', msg: 'Pushing content.json to GitHub…' })

    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/content.json`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
      )
      const getJson = await getRes.json()
      const sha = getJson.sha

      const fileContent = btoa(unescape(encodeURIComponent(JSON.stringify(form, null, 2))))

      const putRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/data/content.json`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update content.json via La'Fai admin`,
            content: fileContent,
            sha,
          }),
        }
      )

      if (putRes.ok) {
        setGhStatus({ type: 'success', msg: 'content.json pushed to GitHub!' })
      } else {
        const err = await putRes.json()
        setGhStatus({ type: 'error', msg: err.message || 'GitHub push failed.' })
      }
    } catch {
      setGhStatus({ type: 'error', msg: 'Network error during push.' })
    }

    setTimeout(() => setGhStatus(null), 5000)
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl italic font-light text-[#f5f0f2] mb-1">
            Content
          </h1>
          <p className="text-xs text-[#f5f0f2]/30">Edit all page text</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGitHubPush}
            className="btn-gold text-xs flex items-center gap-2"
          >
            <Github size={13} />
            Push to GitHub
          </button>
          <button
            onClick={handleSave}
            className="btn-primary text-xs flex items-center gap-2"
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? 'Saved!' : 'Save Content'}
          </button>
        </div>
      </div>

      {ghStatus && (
        <div
          className={`mb-6 px-4 py-3 text-sm border ${
            ghStatus.type === 'success'
              ? 'bg-green-900/20 border-green-500/20 text-green-300'
              : ghStatus.type === 'error'
              ? 'bg-red-900/20 border-red-500/20 text-red-300'
              : 'bg-blue-900/20 border-blue-500/20 text-blue-300'
          }`}
        >
          {ghStatus.msg}
        </div>
      )}

      {/* Hero */}
      <Section title="Hero Section">
        <Field label="Heading (use \n for line breaks)">
          <textarea
            rows={3}
            value={form.hero?.heading || ''}
            onChange={(e) => update('hero.heading', e.target.value)}
            className="input-dark resize-none"
          />
        </Field>
        <Field label="Subheading">
          <textarea
            rows={2}
            value={form.hero?.subheading || ''}
            onChange={(e) => update('hero.subheading', e.target.value)}
            className="input-dark resize-none"
          />
        </Field>
        <Field label="CTA Button Text">
          <input
            type="text"
            value={form.hero?.cta || ''}
            onChange={(e) => update('hero.cta', e.target.value)}
            className="input-dark"
          />
        </Field>
      </Section>

      {/* Featured */}
      <Section title="Featured Products Section">
        <Field label="Heading">
          <input
            type="text"
            value={form.featured?.heading || ''}
            onChange={(e) => update('featured.heading', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Subheading">
          <input
            type="text"
            value={form.featured?.subheading || ''}
            onChange={(e) => update('featured.subheading', e.target.value)}
            className="input-dark"
          />
        </Field>
      </Section>

      {/* About */}
      <Section title="About Page">
        <Field label="Hero Heading">
          <input
            type="text"
            value={form.about?.heroHeading || ''}
            onChange={(e) => update('about.heroHeading', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Hero Subheading">
          <input
            type="text"
            value={form.about?.heroSub || ''}
            onChange={(e) => update('about.heroSub', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Story Heading">
          <input
            type="text"
            value={form.about?.storyHeading || ''}
            onChange={(e) => update('about.storyHeading', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Story Body (use blank line for new paragraph)">
          <textarea
            rows={6}
            value={form.about?.storyBody || ''}
            onChange={(e) => update('about.storyBody', e.target.value)}
            className="input-dark resize-none"
          />
        </Field>
        <Field label="Values Heading">
          <input
            type="text"
            value={form.about?.valuesHeading || ''}
            onChange={(e) => update('about.valuesHeading', e.target.value)}
            className="input-dark"
          />
        </Field>
        {(form.about?.values || []).map((val, i) => (
          <div key={i} className="bg-surface border border-white/5 p-4 mb-3">
            <p className="text-xs text-[#f5f0f2]/30 mb-3">Value {i + 1}</p>
            <Field label="Title">
              <input
                type="text"
                value={val.title}
                onChange={(e) => updateValue(i, 'title', e.target.value)}
                className="input-dark"
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={2}
                value={val.body}
                onChange={(e) => updateValue(i, 'body', e.target.value)}
                className="input-dark resize-none"
              />
            </Field>
          </div>
        ))}
      </Section>

      {/* Contact */}
      <Section title="Contact Page">
        <Field label="Heading">
          <input
            type="text"
            value={form.contact?.heading || ''}
            onChange={(e) => update('contact.heading', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Subheading">
          <input
            type="text"
            value={form.contact?.subheading || ''}
            onChange={(e) => update('contact.subheading', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Email">
          <input
            type="text"
            value={form.contact?.email || ''}
            onChange={(e) => update('contact.email', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Hours">
          <input
            type="text"
            value={form.contact?.hours || ''}
            onChange={(e) => update('contact.hours', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Privacy Note">
          <textarea
            rows={2}
            value={form.contact?.note || ''}
            onChange={(e) => update('contact.note', e.target.value)}
            className="input-dark resize-none"
          />
        </Field>
      </Section>

      {/* FAQ */}
      <Section title="FAQ Items">
        {(form.faq || []).map((item, i) => (
          <div
            key={i}
            className="bg-surface border border-white/5 p-4 mb-3 relative"
          >
            <button
              onClick={() => removeFaq(i)}
              className="absolute top-3 right-3 text-[#f5f0f2]/20 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
            <p className="text-xs text-[#f5f0f2]/30 mb-3">FAQ {i + 1}</p>
            <Field label="Question">
              <input
                type="text"
                value={item.q}
                onChange={(e) => updateFaq(i, 'q', e.target.value)}
                className="input-dark"
              />
            </Field>
            <Field label="Answer">
              <textarea
                rows={3}
                value={item.a}
                onChange={(e) => updateFaq(i, 'a', e.target.value)}
                className="input-dark resize-none"
              />
            </Field>
          </div>
        ))}
        <button
          onClick={addFaq}
          className="btn-outline text-xs flex items-center gap-2 mt-2"
        >
          <Plus size={12} />
          Add FAQ Item
        </button>
      </Section>

      {/* Footer */}
      <Section title="Footer">
        <Field label="Tagline">
          <input
            type="text"
            value={form.footer?.tagline || ''}
            onChange={(e) => update('footer.tagline', e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="Disclaimer">
          <input
            type="text"
            value={form.footer?.disclaimer || ''}
            onChange={(e) => update('footer.disclaimer', e.target.value)}
            className="input-dark"
          />
        </Field>
      </Section>

      {/* Nav links */}
      <Section title="Navigation Links">
        {(form.nav?.links || []).map((link, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateNavLink(i, 'label', e.target.value)}
              className="input-dark flex-1"
              placeholder="Label"
            />
            <input
              type="text"
              value={link.href}
              onChange={(e) => updateNavLink(i, 'href', e.target.value)}
              className="input-dark flex-1"
              placeholder="/path"
            />
          </div>
        ))}
      </Section>
    </div>
  )
}
