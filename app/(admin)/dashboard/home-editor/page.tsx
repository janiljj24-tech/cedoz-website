'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ROW_ID = '00000000-0000-0000-0000-000000000001';

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface ComponentItem {
  title: string;
  description: string;
  imageUrl: string;
}

export default function HomeEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // About Section State
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [aboutImgUrl, setAboutImgUrl] = useState('');
  const [aboutFile, setAboutFile] = useState<File | null>(null);

  // Dynamic Array States
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    const { data } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('id', ROW_ID)
      .single();

    if (data) {
      setAboutTitle(data.about_title || '');
      setAboutDesc(data.about_description || '');
      setAboutImgUrl(data.about_image_url || '');
      setServices(data.services || []);
      setComponents(data.components || []);
    }
    setLoading(false);
  };

  const uploadImage = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('homepage')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('homepage').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalAboutImgUrl = aboutImgUrl;

      if (aboutFile) {
        finalAboutImgUrl = await uploadImage(aboutFile, 'about');
      }

      const { error } = await supabase
        .from('homepage_content')
        .update({
          about_title: aboutTitle,
          about_description: aboutDesc,
          about_image_url: finalAboutImgUrl,
          services: services,
          components: components,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ROW_ID);

      if (error) throw error;

      setAboutImgUrl(finalAboutImgUrl);
      setAboutFile(null);
      alert('Homepage details updated successfully!');
    } catch (err: any) {
      alert('Error saving data: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Services Helpers
  const addService = () => setServices([...services, { title: '', description: '', icon: '⚡' }]);
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  const updateService = (index: number, key: keyof ServiceItem, val: string) => {
    const updated = [...services];
    updated[index][key] = val;
    setServices(updated);
  };

  // Components Helpers
  const addComponent = () => setComponents([...components, { title: '', description: '', imageUrl: '' }]);
  const removeComponent = (index: number) => setComponents(components.filter((_, i) => i !== index));
  const updateComponent = (index: number, key: keyof ComponentItem, val: string) => {
    const updated = [...components];
    updated[index][key] = val;
    setComponents(updated);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Homepage Editor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: '#0f172a' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        ⚙️ Manage Homepage Content
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* About Us Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            1. About Us Section
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Title</label>
              <input 
                type="text" 
                value={aboutTitle} 
                onChange={(e) => setAboutTitle(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Description</label>
              <textarea 
                rows={4}
                value={aboutDesc} 
                onChange={(e) => setAboutDesc(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Upload About Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setAboutFile(e.target.files?.[0] || null)} 
              />
              {aboutImgUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={aboutImgUrl} alt="About preview" style={{ height: '80px', borderRadius: '6px' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>2. Our Services</h2>
            <button type="button" onClick={addService} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Service
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {services.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <input 
                  type="text" 
                  placeholder="Emoji/Icon" 
                  value={item.icon} 
                  onChange={(e) => updateService(idx, 'icon', e.target.value)}
                  style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Service Title" 
                    value={item.title} 
                    onChange={(e) => updateService(idx, 'title', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Service Description" 
                    value={item.description} 
                    onChange={(e) => updateService(idx, 'description', e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button type="button" onClick={() => removeService(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Components Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>3. Our Components / Features</h2>
            <button type="button" onClick={addComponent} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Component
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {components.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <input 
                    type="text" 
                    placeholder="Component Title" 
                    value={item.title} 
                    onChange={(e) => updateComponent(idx, 'title', e.target.value)}
                    style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginRight: '0.5rem' }}
                  />
                  <button type="button" onClick={() => removeComponent(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✕
                  </button>
                </div>
                <textarea 
                  placeholder="Component Details" 
                  value={item.description} 
                  onChange={(e) => updateComponent(idx, 'description', e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          style={{ padding: '0.875rem 2rem', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          {saving ? 'Publishing Changes...' : 'Save & Publish to Homepage'}
        </button>
      </form>
    </div>
  );
}