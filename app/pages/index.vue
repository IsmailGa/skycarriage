<script setup lang="ts">
import { services } from '~/data/services'
import { site } from '~/data/site'

const { t } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const url = siteUrl.replace(/\/$/, '')
const image = `${url}/media/og-image.jpg`
const faqs = useMsgList('faq.items', ['q', 'a'] as const)

// Title, description, Open Graph and Twitter tags are localised; canonical + hreflang come from useLocaleHead (app.vue).
useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  keywords: () => t('meta.keywords'),
  author: site.name,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  ogType: 'website',
  ogSiteName: site.name,
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogImage: image,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => t('meta.ogAlt'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('meta.title'),
  twitterDescription: () => t('meta.description'),
  twitterImage: image,
})

const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${url}/#organization`,
      name: site.name,
      url,
      logo: { '@type': 'ImageObject', url: `${url}/logo.png`, width: 512, height: 512 },
      description: t('meta.orgDesc'),
      email: site.email,
      ...(site.hasRealPhone ? { telephone: site.phone } : {}),
    },
    { '@type': 'WebSite', '@id': `${url}/#website`, url, name: site.name, publisher: { '@id': `${url}/#organization` }, inLanguage: ['en', 'ru', 'uz'] },
    {
      '@type': 'WebPage', name: t('meta.title'), description: t('meta.description'), isPartOf: { '@id': `${url}/#website` },
      about: { '@id': `${url}/#organization` }, primaryImageOfPage: { '@type': 'ImageObject', url: image },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${url}/#service`,
      name: site.name,
      url,
      image,
      description: t('meta.orgDesc'),
      provider: { '@id': `${url}/#organization` },
      serviceType: t('meta.serviceType'),
      areaServed: 'Worldwide',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: t('meta.catalog'),
        itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t(`services.items.${s.key}.title`), description: t(`services.items.${s.key}.desc`) } })),
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.value.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}))

useHead(() => ({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd.value) }] }))
</script>

<template>
  <div>
    <HeroSection />
    <ServicesSection />
    <CargoExplorer />
    <CinematicBand />
    <HowItWorks />
    <GroundOps />
    <WhyUs />
    <NetworkMap />
    <!-- <PartnersSection /> -->
    <FaqSection />
    <QuoteSection />
  </div>
</template>
