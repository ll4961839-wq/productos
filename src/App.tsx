/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Send,
  Loader2,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Package,
  Settings,
  Plus,
  ChevronDown
} from 'lucide-react';
import { supabase } from './supabase';
import { Producto, Categoria } from './types';

// Utilidad para limpiar nombres de archivos (Saneamiento para Storage)
const sanitizeFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  
  const cleanName = nameWithoutExt
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
    .replace(/[^a-z0-9]/g, '-') // Cambiar todo lo no alfanumérico por guion
    .replace(/-+/g, '-') // Evitar guiones múltiples
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio o final

  return `${cleanName}-${Date.now()}.${extension}`;
};

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos');
  const [adminMode, setAdminMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  // Guatemala random WhatsApp configuration and social links
  const emailVal = 'Agricovetsa@gmail.com';
  const instagramUrl = 'https://www.instagram.com/agricovetsa?igsh=eDdtNHdicjAyaTQ4';
  const facebookUrl = 'https://www.facebook.com/share/18CEGyvSuv/';

  // All WhatsApp numbers for load-balancing
  const WHATSAPP_NUMBERS = [
    { raw: '50254743595', display: '+502 5474 3595' },
    { raw: '50241323037', display: '+502 4132 3037' }
  ];

  // Pick a random WhatsApp number at the instant of user click to distribute traffic
  const handleWhatsAppRedirect = (customText?: string) => {
    const chosen = WHATSAPP_NUMBERS[Math.floor(Math.random() * WHATSAPP_NUMBERS.length)];
    const url = customText 
      ? `https://wa.me/${chosen.raw}?text=${encodeURIComponent(customText)}`
      : `https://wa.me/${chosen.raw}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProductInquiry = (nombre: string, id: string | number) => {
    handleWhatsAppRedirect(`¡Hola! Quisiera info sobre el producto: ${nombre} (Ref: ${id})`);
  };

  // Modal display controllers for Terms & Privacy
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    fetchProductos();

    // Check URL parameters for premium secret admin activation e.g., ?admin=true
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setAdminMode(true);
      }
    }
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [categoriaActiva, filtro]);

  async function fetchProductos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('Nombre', { ascending: true });

      if (error) throw error;
      setProductos(data || []);
    } catch (err: any) {
      console.error('Error fetching productos:', err);
      setError('No se pudo cargar el catálogo. Verifica la conexión a Supabase.');
    } finally {
      setLoading(false);
    }
  }

  // Función helper para comprimir la imagen en el cliente antes de subirla
  const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.82): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular proporciones óptimas
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  resolve(file); // fallback
                }
              },
              'image/jpeg',
              quality
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Manejo de subida de imágenes a Supabase Storage
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, id: string | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(`${id}`);
      
      const fileName = sanitizeFileName(file.name);
      
      // Comprimir imagen antes de subir
      let uploadPayload: File | Blob = file;
      if (file.type.startsWith('image/')) {
        uploadPayload = await compressImage(file);
      }
      
      // 1. Subida al Bucket 'productos'
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, uploadPayload, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);

      // 3. Actualizar DB (Ambas columnas para compatibilidad)
      const { error: updateError } = await supabase
        .from('productos')
        .update({ Imagen: publicUrl, imagen_url: publicUrl })
        .eq('Identificación', id);

      if (updateError) throw updateError;

      // 4. Actualizar estado local
      setProductos(prev => prev.map(p => 
        p.Identificación === id ? { ...p, Imagen: publicUrl, imagen_url: publicUrl } : p
      ));

      alert("✨ ¡Imagen optimizada y guardada correctamente en Supabase!");
    } catch (err: any) {
      console.error('Error en carga:', err);
      alert('Error al subir la imagen: ' + (err.message || 'Error desconocido'));
    } finally {
      setUploading(null);
    }
  };

  // Función para Crear Nuevo Producto con Imagen (Supabase Storage + DB)
  const handleCreateProduct = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newProductName.trim()) {
      alert("Por favor ingresa un nombre para el producto.");
      return;
    }

    try {
      setIsCreating(true);
      const fileName = sanitizeFileName(file.name);

      // Comprimir imagen antes de subir para carga ultrarrápida
      let uploadPayload: File | Blob = file;
      if (file.type.startsWith('image/')) {
        uploadPayload = await compressImage(file);
      }

      // 1. Subida al Bucket 'productos'
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, uploadPayload, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);

      // 3. Crear Nueva Fila en Supabase 'productos'
      const { data: insertedData, error: insertError } = await supabase
        .from('productos')
        .insert([{ 
          Nombre: newProductName, 
          Categoría: newProductCategory || 'Otros',
          imagen_url: publicUrl,
          Existencias: '+ Disponible', // Valor por defecto
          resaltado: false
        }])
        .select();

      if (insertError) throw insertError;

      // 4. Actualizar estado local y limpiar
      if (insertedData) {
        setProductos(prev => [insertedData[0], ...prev]);
      }
      setNewProductName('');
      setNewProductCategory('');
      alert("Producto creado exitosamente con imagen optimizada.");
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      alert('Error al crear el producto: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsCreating(false);
    }
  };

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.Categoría)))];

  const productosFiltrados = productos.filter(p => {
    const cumpleBusqueda = p.Nombre.toLowerCase().includes(filtro.toLowerCase()) || 
                           p.Categoría.toLowerCase().includes(filtro.toLowerCase());
    const cumpleCategoria = categoriaActiva === 'Todos' || p.Categoría === categoriaActiva;
    return cumpleBusqueda && cumpleCategoria;
  });

  const productosAMostrar = productosFiltrados.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar Premium Sticky */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-neutral-100/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/agricovet.png" 
              alt="Agricovet Logo" 
              className="h-9 sm:h-11 w-auto object-contain cursor-pointer" 
              onError={(e) => {
                // If agricovet.png is not found, fallback to elegant text logo
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('navbar-text-logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div id="navbar-text-logo-fallback" className="hidden flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-tighter text-neutral-900 uppercase">
                AGRIC<span className="text-emerald-600">OVET</span>
                <span className="block text-[6px] sm:text-[8px] font-medium tracking-widest text-neutral-400 -mt-1">Insumos de Vanguardia</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 text-xs sm:text-sm font-bold tracking-wide uppercase text-neutral-500">
            <a href="#inicio" className="hover:text-emerald-600 transition-colors hidden sm:inline-block">Inicio</a>
            <a href="#catálogo" className="hover:text-emerald-600 transition-colors hidden sm:inline-block">Catálogo</a>
            <button 
              onClick={() => handleWhatsAppRedirect()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 sm:gap-2 font-black cursor-pointer border-none"
            >
              <Phone className="w-4 h-4" /> <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="pt-20">
        
        {/* ADMIN PANEL - NEW PRODUCT FORM */}
        <AnimatePresence>
          {adminMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border-b border-emerald-100 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-emerald-100">
                  <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                    <Upload className="w-6 h-6 text-emerald-600" /> Agregar Nuevo Producto
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6 items-end">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Nombre del Producto</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Iverplus La 10ml 1%"
                        className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Categoría</label>
                      <select 
                        className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                      >
                        <option value="">Selecciona Categoría</option>
                        {categorias.filter(c => c !== 'Todos').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="newProductFile" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleCreateProduct}
                        disabled={isCreating || !newProductName.trim()}
                      />
                      <label 
                        htmlFor="newProductFile"
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${
                          isCreating || !newProductName.trim() 
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                        }`}
                      >
                        {isCreating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Subir Imagen y Guardar</>
                        )}
                      </label>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-neutral-400 italic">
                    * Al subir la imagen, se creará automáticamente el registro en la base de datos con la URL pública vinculada.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>        {/* HERO SECTION - MODERN AND CONVERSION FOCUS */}
        <section id="inicio" className="relative py-28 md:py-40 bg-white overflow-hidden border-b border-neutral-100/60">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[400px] h-[400px] bg-sky-50 rounded-full blur-3xl opacity-40" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-7 text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-8">
                  <ShieldCheck className="w-4 h-4" /> Distribuidor Autorizado Premium
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 leading-[1.05] mb-8 tracking-tighter">
                  Insumos Veterinarios <br />
                  y Agrícolas <br />
                  <span className="text-emerald-600 font-black">de Alta Calidad.</span>
                </h1>
                <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-xl leading-relaxed font-semibold">
                  Abastecemos con excelencia a veterinarias, clínicas, almacenes y productores. Garantizamos stock real y la asesoría de profesionales experimentados para tu campo.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#catálogo" className="px-8 py-4.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50 flex items-center gap-3">
                    Explorar Catálogo <ChevronRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleWhatsAppRedirect('Hola Agricovet, me gustaría recibir más información u obtener una asesoría general.')}
                    className="px-8 py-4.5 bg-neutral-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all shadow-xl flex items-center gap-3 cursor-pointer border-none"
                  >
                    Consulta Inmediata <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="lg:col-span-5 relative group"
              >
                <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-[0_45px_90px_-25px_rgba(0,0,0,0.12)] relative">
                  <img 
                    src="https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=1000" 
                    alt="Clínica Veterinaria Agricovet" 
                    className="w-full h-full object-cover transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 to-transparent" />
                </div>
                
                {/* Floating details */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-12 -left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Envíos Rápidos</span>
                    <span className="block text-sm font-black text-neutral-800">Despacho Certificado</span>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-12 -right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                    <Package className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Almacén</span>
                    <span className="block text-sm font-black text-neutral-800">+130 Insumos</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION - ENHANCED USER SEARCH */}
        <section id="catálogo" className="py-24 bg-neutral-50/60 min-h-screen border-b border-neutral-100/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Catálogo Actualizado</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter mb-4">Portafolio Agricovet</h2>
                <p className="text-neutral-500 font-semibold leading-relaxed">
                  Encuentra los medicamentos, biológicos y productos agropecuarios ideales. Utiliza el buscador y las categorías dinámicas para simplificar tu consulta.
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">¿Qué producto estás buscando?</label>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Ej. Oxitetraciclina, Iverplus, Duwest..."
                    className="w-full pl-14 pr-6 py-4.5 bg-white border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-semibold"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex gap-2.5 overflow-x-auto pb-10 scrollbar-hide">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    categoriaActiva === cat 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/50 scale-[1.03]' 
                    : 'bg-white text-neutral-400 hover:text-neutral-900 border border-neutral-100 hover:border-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Status */}
            {loading ? (
              <CatalogSkeleton />
            ) : error ? (
              <div className="bg-white p-16 rounded-3xl text-center border border-red-100 shadow-xl max-w-xl mx-auto">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-5" />
                <p className="text-xl font-black text-neutral-900 mb-2">Error de Conexión</p>
                <p className="text-neutral-400 font-medium mb-6">{error}</p>
                <button onClick={fetchProductos} className="px-8 py-3.5 bg-neutral-900 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all">
                  Reintentar Sincronización
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                  <AnimatePresence mode="popLayout">
                    {productosAMostrar.map((p, idx) => (
                      <ProductCard 
                        key={p.Identificación} 
                        producto={p} 
                        index={idx} 
                        adminMode={adminMode}
                        isUploading={uploading === `${p.Identificación}`}
                        onImageChange={handleImageUpload}
                        onInquiry={handleProductInquiry}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {productosFiltrados.length > visibleCount && (
                  <div className="mt-16 flex flex-col items-center justify-center space-y-4">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                      Mostrando {Math.min(visibleCount, productosFiltrados.length)} de {productosFiltrados.length} productos
                    </p>
                    <div className="w-48 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${(Math.min(visibleCount, productosFiltrados.length) / productosFiltrados.length) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setVisibleCount(prev => prev + 12)}
                      className="mt-4 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.03] shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                    >
                      Cargar más productos <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {productosFiltrados.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-24 text-center bg-white rounded-[2rem] border border-dashed border-neutral-200 shadow-xs"
                  >
                    <Package className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-lg font-bold text-neutral-400 mb-2">No encontramos registros para "{filtro}"</p>
                    <button onClick={() => {setFiltro(''); setCategoriaActiva('Todos');}} className="text-emerald-600 font-extrabold text-sm hover:underline">Limpiar filtros de búsqueda</button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        {/* LAB GRID - MOVED DOWN FOR REDIRECT FLOW */}
        <section id="laboratorios" className="py-20 bg-white border-b border-neutral-100/60">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-12">Principales Laboratorios y Marcas Aliadas</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {['RAINBOW', 'BIOZOO', 'WELLCO', 'TECNIAGRO', 'LAVET', 'FORAGRO'].map(lab => (
                <span key={lab} className="text-xl md:text-2xl font-black text-neutral-400 hover:text-neutral-900 transition-colors cursor-default tracking-wider">
                  {lab}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CANALES DE COMUNICACIÓN */}
        <section className="py-24 bg-neutral-50/40 border-b border-neutral-100/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-3">Atención Inmediata</span>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">Vías de Contacto Directo</h2>
              <p className="text-neutral-500 font-semibold mt-2">¿Necesitas una cotización formal o tienes dudas sobre insumos para tu campo?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ChannelCard 
                icon={<MessageCircle className="w-10 h-10" />}
                title="WhatsApp Directo"
                subtitle="Atención Ejecutiva"
                description="Conéctate instantáneamente con un ejecutivo de guardia para asesoría o pedidos inmediatos."
                theme="emerald"
                onClick={() => handleWhatsAppRedirect()}
              />
              <ChannelCard 
                icon={<Instagram className="w-10 h-10" />}
                title="Comunidad IG"
                subtitle="@agricovetsa"
                description="Únete a nuestro perfil de Instagram de Agricovet para contenido continuo y novedades."
                theme="pink"
                link={instagramUrl}
              />
              <ChannelCard 
                icon={<Facebook className="w-10 h-10" />}
                title="Catálogo FB"
                subtitle="Página Oficial"
                description="Explora nuestras publicaciones y conecta con nosotros en Facebook."
                theme="blue"
                link={facebookUrl}
              />
            </div>
          </div>
        </section>

        {/* SECTION CONTACT / CTA */}
        <section id="contacto" className="py-16 sm:py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-neutral-900 rounded-3xl sm:rounded-[4rem] p-6 sm:p-12 md:p-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -mr-40 -mt-40" />
              
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-tight sm:leading-none mb-6 sm:mb-10">
                    ¿Hablamos <br />
                    de tu <span className="text-emerald-500">finca?</span>
                  </h2>
                  <p className="text-neutral-400 text-base sm:text-xl mb-8 sm:mb-12 leading-relaxed font-semibold">
                    Asesoría personalizada sobre dosificación, nuevos laboratorios o pedidos a volumen. Estamos listos para potenciar tu productividad.
                  </p>
                  
                  <div className="space-y-6 sm:space-y-10">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-800 rounded-2xl sm:rounded-3xl flex items-center justify-center text-emerald-500 shrink-0 mt-1">
                        <Phone className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Central de Pedidos o Consultas</p>
                        <div className="space-y-1.5 sm:space-y-3">
                          <p className="text-base sm:text-2xl font-black">
                            <a href="https://wa.me/50254743595" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                              +502 5474 3595 <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">Línea 1</span>
                            </a>
                          </p>
                          <p className="text-base sm:text-2xl font-black">
                            <a href="https://wa.me/50241323037" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                              +502 4132 3037 <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">Línea 2</span>
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-800 rounded-2xl sm:rounded-3xl flex items-center justify-center text-sky-500 shrink-0">
                        <Mail className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Escríbenos</p>
                        <p className="text-lg sm:text-2xl font-black">
                          <a href={`mailto:${emailVal}`} className="hover:text-sky-400 transition-colors">
                            {emailVal}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl">
                   <form 
                    className="space-y-4 sm:space-y-6" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const msg = `Hola Agricovet, soy ${form.name.value}. Busco información sobre: ${form.message.value}`;
                      handleWhatsAppRedirect(msg);
                    }}
                  >
                    <div>
                      <input name="name" type="text" placeholder="Nombre completo" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white text-sm sm:text-base font-medium" />
                    </div>
                    <div>
                      <input name="email" type="email" placeholder="Correo electrónico" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white text-sm sm:text-base font-medium" />
                    </div>
                    <div>
                      <textarea name="message" rows={3} placeholder="¿Qué insumos necesitas hoy?" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white text-sm sm:text-base font-medium resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full py-4 sm:py-6 bg-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-2 sm:gap-3 group">
                      Iniciar Conversación <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-20 bg-neutral-950 text-neutral-400 border-t border-neutral-900 relative z-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          {/* Logo Brand with dynamic fallback */}
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/agricovet.png" 
              alt="Agricovet Logo" 
              className="h-10 sm:h-12 w-auto object-contain mb-2" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('footer-text-logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div id="footer-text-logo-fallback" className="hidden flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="text-sm font-black tracking-widest uppercase text-white">Agricovet Insumos</span>
            </div>
            <p className="text-[10px] text-neutral-600 tracking-wider">Insumos de Vanguardia</p>
          </div>

          {/* Social Links Panel */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            <button 
              onClick={() => handleWhatsAppRedirect()}
              className="w-12 h-12 bg-neutral-900 hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center text-emerald-500 transition-all shadow-md border-none cursor-pointer"
              title="Contactar por WhatsApp"
            >
              <Phone className="w-5 h-5" />
            </button>
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-neutral-900 hover:bg-pink-600 hover:text-white rounded-full flex items-center justify-center text-pink-500 transition-all shadow-md"
              title="Seguir en Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-neutral-900 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center text-blue-500 transition-all shadow-md"
              title="Visitar en Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Terms and Privacy Triggers */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <button 
              onClick={() => setShowTerms(true)} 
              className="hover:text-emerald-500 transition-colors cursor-pointer"
            >
              Términos y Condiciones
            </button>
            <span className="text-neutral-800 hidden sm:inline">•</span>
            <button 
              onClick={() => setShowPrivacy(true)} 
              className="hover:text-emerald-500 transition-colors cursor-pointer"
            >
              Política de Privacidad
            </button>
          </div>

          <div className="border-t border-neutral-900/40 pt-10 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-600">Hecho para el campo moderno</p>
            <p className="text-[10px] text-neutral-700">© 2026 Agricovet Ltda. Salud Animal e Insumos Premium.</p>
          </div>
        </div>
      </footer>

      {/* LEGAL MODALS */}
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Términos y Condiciones">
        <div className="space-y-6">
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">1. Aceptación de los Términos</h4>
            <p>Al acceder, navegar o utilizar la plataforma web de Agricovet, usted acepta quedar vinculado por los presentes Términos y Condiciones, así como por todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar este sitio.</p>
          </div>
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">2. Uso de Productos Veterinarios y Agrícolas</h4>
            <p>Los productos listados en nuestro catálogo digital son únicamente de carácter informativo y con fines de pre-pedido o cotización profesional. La prescripción, dosificación y aplicación de medicamentos veterinarios e insumos agrícolas de alto grado deben realizarse estrictamente bajo la supervisión de un médico veterinario zootecnista colegiado o un agrónomo certificado.</p>
          </div>
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">3. Proceso de Pedidos y Cotizaciones</h4>
            <p>Agricovet opera como canal directo de consultas comerciales vinculadas a WhatsApp. Las especificaciones de stock, marcas aliadas y precios están sujetas a fluctuaciones del mercado y confirmación expresa de nuestra parte al momento de consolidar la comunicación directa.</p>
          </div>
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">4. Limitación de Responsabilidad</h4>
            <p>En ningún caso Agricovet será responsable por el uso inadecuado de las sustancias químicas o medicamentos veterinarios adquiridos por el cliente, ni por las pérdidas productivas o daños a la fauna/cultivos resultantes de aplicaciones erróneas.</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Privacidad">
        <div className="space-y-6">
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">1. Tratamiento de Datos Personales</h4>
            <p>En Agricovet respetamos profundamente su privacidad. Los datos suministrados voluntariamente en nuestros formularios de contacto (tales como nombre, dirección de correo electrónico y mensajes informativos) son encriptados de extremo a extremo y procesados con el único fin de proveer una atención al cliente premium y gestionar la logística de sus pedidos agrícolas.</p>
          </div>
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">2. Enlaces a Terceros e iFrames</h4>
            <p>Nuestra plataforma puede integrar flujos directos a plataformas como WhatsApp, Facebook e Instagram para facilitar la comunicación constante. Agricovet no almacena conversaciones ni historiales de mensajes fuera de los canales autorizados para la debida atención comercial.</p>
          </div>
          <div>
            <h4 className="font-black text-neutral-950 uppercase text-xs tracking-widest mb-2">3. Derechos del Usuario</h4>
            <p>Usted conserva en todo momento el pleno derecho a solicitar la rectificación, actualización o eliminación completa de su información de contacto de nuestros registros internos, enviando una simple solicitud formal a nuestra casilla electrónica centralizada: <strong>{emailVal}</strong>.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// GENERAL MODAL SHELL SYSTEM
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Paper Container */}
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col border border-neutral-100">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-all flex items-center justify-center select-none"
          >
            ✕
          </button>
        </div>
        <div className="p-8 text-neutral-600 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[50vh] space-y-4">
          {children}
        </div>
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// SUB-COMPONENTS
function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 animate-pulse">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="aspect-square w-full bg-neutral-100/80 rounded-2xl" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-4 w-12 bg-neutral-100/80 rounded" />
            <div className="h-3 w-10 bg-neutral-100/50 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-11/12 bg-neutral-100/80 rounded" />
            <div className="h-3.5 w-2/3 bg-neutral-100/80 rounded animate-pulse" />
          </div>
          <div className="pt-2 sm:pt-4 border-t border-neutral-50 flex items-center justify-between">
            <div className="h-3 w-10 bg-neutral-100/80 rounded" />
            <div className="h-8 w-16 bg-neutral-100/80 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChannelCard({ icon, title, subtitle, description, theme, link, onClick }: { 
  icon: ReactNode, 
  title: string, 
  subtitle: string, 
  description: string, 
  theme: string, 
  link?: string, 
  onClick?: () => void 
}) {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
  };

  return (
    <motion.a 
      href={link || '#'}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      target={link ? "_blank" : undefined}
      rel={link ? "noopener noreferrer" : undefined}
      whileHover={{ y: -10 }}
      className="group p-10 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
    >
      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-10 border transition-all duration-500 ${themes[theme]}`}>
        {icon}
      </div>
      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">{subtitle}</p>
      <h3 className="text-2xl font-black text-neutral-900 mb-4 flex items-center gap-3">
        {title} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </h3>
      <p className="text-neutral-500 font-medium leading-relaxed">{description}</p>
    </motion.a>
  );
}

function ProductCard({ producto, index, adminMode, isUploading, onImageChange, onInquiry }: { 
  producto: Producto, 
  index: number, 
  adminMode: boolean, 
  isUploading: boolean,
  onImageChange: (e: ChangeEvent<HTMLInputElement>, id: string | number) => void | Promise<void>,
  onInquiry: (nombre: string, id: string | number) => void,
  whatsappNo?: string,
  key?: any
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const stockLimit = 5;
  const isBajoPedido = typeof producto.Existencias === 'string' && producto.Existencias.toLowerCase().includes('pedido') || (typeof producto.Existencias === 'number' && producto.Existencias < stockLimit);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-[0_45px_90px_-25px_rgba(0,0,0,0.12)] hover:border-emerald-100 transition-all group flex flex-col h-full relative"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100/50 group/img">
        {/* Shimmer skeleton behind the image */}
        {(!producto.imagen_url && !producto.Imagen) ? null : (
          <div className={`absolute inset-0 bg-neutral-100 animate-pulse transition-opacity duration-300 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
        )}

        {(!producto.imagen_url && !producto.Imagen) && adminMode ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 border-2 border-dashed border-neutral-200 group-hover:bg-neutral-200 transition-colors cursor-pointer p-4"
          >
            <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300 mb-1.5" />
            <span className="text-[8px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">Sin Imagen</span>
            <span className="text-[6px] sm:text-[8px] text-neutral-400 mt-1 text-center">Haz clic para subir</span>
          </div>
        ) : (
          <img 
            src={producto.imagen_url || producto.Imagen || "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&q=80&w=600"} 
            alt={producto.Nombre}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
        )}
        
        {/* Badges stage */}
        <div className="absolute inset-x-3 sm:inset-x-4 top-3 sm:top-4 flex justify-between items-start">
          {producto.resaltado && (
            <div className="bg-neutral-900 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
              Destacado
            </div>
          )}
        </div>
 
        {/* Admin Image Control Overlay */}
        {adminMode && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 sm:gap-4 text-center p-4 sm:p-6">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 animate-spin" />
                <p className="text-white font-black uppercase tracking-widest text-[8px] sm:text-xs">Sincronizando Cloud...</p>
              </>
            ) : (
              <>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-neutral-900 cursor-pointer hover:scale-110 transition-transform shadow-xl"
                >
                  <Upload className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <p className="text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px]">Actualizar en Supabase</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  accept="image/*"
                  onChange={(e) => onImageChange(e, producto.Identificación)}
                />
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Product Content Stage */}
      <div className="p-4 sm:p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
          <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg uppercase tracking-[0.1em] sm:tracking-widest truncate max-w-[85px] sm:max-w-none">
            {producto.Categoría}
          </span>
          <span className="text-[7px] sm:text-[9px] text-neutral-300 font-mono font-bold tracking-tighter">
            ID_{producto.Identificación}
          </span>
        </div>
        
        <h3 className="text-xs sm:text-lg font-extrabold sm:font-black text-neutral-900 mb-3 sm:mb-6 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2 h-8 sm:h-auto overflow-hidden">
          {producto.Nombre}
        </h3>
        
        <div className="mt-auto space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between gap-1.5">
            <div className={`flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] ${isBajoPedido ? 'text-orange-500' : 'text-emerald-500'}`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isBajoPedido ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="truncate">{isBajoPedido ? 'Pedir' : 'Stock'}</span>
            </div>
            
            {producto.Precio && (
              <span className="text-sm sm:text-xl font-black text-neutral-900 tracking-tighter">
                ${producto.Precio}
              </span>
            )}
          </div>
 
          <button 
            onClick={() => onInquiry(producto.Nombre, producto.Identificación)}
            className="w-full py-2.5 sm:py-4 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-black text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>Consultar</span> <MessageCircle className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
