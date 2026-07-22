import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0; // Ensures fresh data load on request

async function getHomepageContent() {
  const { data } = await supabase
    .from('homepage_content')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  return data;
}

export default async function PublicHomePage() {
  const content = await getHomepageContent();

  const services = content?.services || [];
  const components = content?.components || [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
      
      {/* Hero / About Us Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', color: '#0369a1', marginBottom: '1.25rem' }}>
            {content?.about_title || 'About Us'}
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.7', whitespace: 'pre-line' }}>
            {content?.about_description || 'Welcome to our platform.'}
          </p>
        </div>

        {content?.about_image_url && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <img 
              src={content.about_image_url} 
              alt="About Us" 
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
        )}
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section style={{ backgroundColor: '#ffffff', padding: '5rem 2rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
              Our Services
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {services.map((item: any, idx: number) => (
                <div key={idx} style={{ padding: '2rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon || '⚡'}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Components Section */}
      {components.length > 0 && (
        <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
            Our Components
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {components.map((item: any, idx: number) => (
              <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#0284c7' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}