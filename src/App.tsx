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
  Settings
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

  useEffect(() => {
    fetchProductos();
  }, []);

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

  // Manejo de subida de imágenes a Supabase Storage
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, id: string | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(`${id}`);
      
      const fileName = sanitizeFileName(file.name);
      
      // 1. Subida al Bucket 'productos'
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file, { upsert: true });

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

      alert("✨ ¡Imagen guardada correctamente en Supabase!");
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

      // 1. Subida al Bucket 'productos'
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file, { upsert: true });

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
      alert("Producto creado exitosamente.");
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar Premium */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-neutral-900 uppercase">
              AGRIC<span className="text-emerald-600">OVET</span>
              <span className="block text-[8px] font-medium tracking-widest text-neutral-400 -mt-1">Insumos de Vanguardia</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-wide uppercase text-neutral-500">
            <a href="#inicio" className="hover:text-emerald-600 transition-colors">Inicio</a>
            <a href="#catálogo" className="hover:text-emerald-600 transition-colors">Catálogo</a>
            <a href="#laboratorios" className="hover:text-emerald-600 transition-colors">Labs</a>
            <button 
              onClick={() => setAdminMode(!adminMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${adminMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
              title="Panel de Administración"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{adminMode ? 'Admin On' : 'Admin Off'}</span>
            </button>
            <a href="https://wa.me/573100000000" className="bg-neutral-900 text-white px-6 py-2.5 rounded-full hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-200">
              WhatsApp
            </a>
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
        </AnimatePresence>
        
        {/* HERO SECTION - REFINED */}
        <section id="inicio" className="relative py-24 md:py-40 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[400px] h-[400px] bg-sky-50 rounded-full blur-3xl opacity-40" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-8">
                  <ShieldCheck className="w-4 h-4" /> Distribuidor Oficial Premium
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-neutral-900 leading-[0.95] mb-8 tracking-tighter">
                  Salud animal <br />
                  <span className="text-emerald-600">sin límites.</span>
                </h1>
                <p className="text-xl text-neutral-500 mb-10 max-w-lg leading-relaxed font-medium">
                  Abastecemos a veterinarias y productores con los insumos más avanzados del mercado global. Calidad certificada para el campo moderno.
                </p>
                <div className="flex flex-wrap gap-5">
                  <a href="#catálogo" className="px-10 py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center gap-3">
                    Explorar Catálogo <ChevronRight className="w-4 h-4" />
                  </a>
                  <div className="flex -space-x-3 items-center ml-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-neutral-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                    <span className="ml-6 text-xs font-bold text-neutral-400">+500 Clientes felices</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative group"
              >
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative">
                  <img 
                    src="https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=1000" 
                    alt="Clinica Veterinaria" 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                </div>
                
                {/* Float card 1 */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-20 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-neutral-100 flex items-center gap-5"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Envíos Hoy</p>
                    <p className="text-lg font-black text-neutral-800">Entrega Express</p>
                  </div>
                </motion.div>

                {/* Float card 2 */}
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-neutral-100 flex items-center gap-5"
                >
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Stock Real</p>
                    <p className="text-lg font-black text-neutral-800">+5,000 Insumos</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* COMMUNICATION CHANNELS */}
        <section className="py-24 bg-white border-y border-neutral-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <ChannelCard 
                icon={<MessageCircle className="w-12 h-12" />}
                title="WhatsApp Directo"
                subtitle="Atención Profesional"
                description="Habla con un especialista ahora mismo para asesoría técnica."
                theme="emerald"
                link="https://wa.me/something"
              />
              <ChannelCard 
                icon={<Instagram className="w-12 h-12" />}
                title="Comunidad IG"
                subtitle="@agricovet_insumos"
                description="Únete a nuestra comunidad de más de 10k seguidores."
                theme="pink"
                link="#"
              />
              <ChannelCard 
                icon={<Facebook className="w-12 h-12" />}
                title="Catálogo FB"
                subtitle="Tienda Digital"
                description="Explora nuestras promociones de temporada en Facebook."
                theme="blue"
                link="#"
              />
            </div>
          </div>
        </section>

        {/* LAB GRID - NEW SECTION */}
        <section id="laboratorios" className="py-24 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-12">Laboratorios Aliados</p>
            <div className="flex flex-wrap justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['RAINBOW', 'BIOZOO', 'WELLCO', 'TECNIAGRO', 'LAVET', 'FORAGRO'].map(lab => (
                <span key={lab} className="text-2xl font-black text-neutral-400 hover:text-neutral-900 transition-colors cursor-default">
                  {lab}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CATALOG SECTION - THE CORE */}
        <section id="catálogo" className="py-32 bg-neutral-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div className="max-w-xl">
                <h2 className="text-5xl font-black text-neutral-900 tracking-tighter mb-4">Catálogo Digital</h2>
                <p className="text-neutral-500 font-medium leading-relaxed">
                  Busca entre más de 136 productos especializados. Filtra por categoría o marca para encontrar exactamente lo que tu clínica o finca necesita.
                </p>
              </div>

              <div className="flex-1 max-w-md">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Inyectables, vacunas, instrumentos..."
                    className="w-full pl-14 pr-6 py-5 bg-white border border-neutral-200 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex gap-3 overflow-x-auto pb-10 scrollbar-hide">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`flex-shrink-0 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    categoriaActiva === cat 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105' 
                    : 'bg-white text-neutral-400 hover:text-neutral-900 border border-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Status */}
            {loading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-[0.2em] text-xs">Accediendo a la nube Agricovet...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-red-50 shadow-2xl">
                <AlertCircle className="w-20 h-20 text-red-100 mx-auto mb-6" />
                <p className="text-2xl font-black text-neutral-900 mb-2">Error de Sincronización</p>
                <p className="text-neutral-400 mb-8">{error}</p>
                <button onClick={fetchProductos} className="px-10 py-4 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all">
                  Reintentar Conexión
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  <AnimatePresence mode="popLayout">
                    {productosFiltrados.map((p, idx) => (
                      <ProductCard 
                        key={p.Identificación} 
                        producto={p} 
                        index={idx} 
                        adminMode={adminMode}
                        isUploading={uploading === `${p.Identificación}`}
                        onImageChange={handleImageUpload}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {productosFiltrados.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-40 text-center bg-white rounded-[3rem] border border-dashed border-neutral-200"
                  >
                    <Package className="w-24 h-24 text-neutral-100 mx-auto mb-6" />
                    <p className="text-xl font-bold text-neutral-400">No encontramos coincidencias para "{filtro}"</p>
                    <button onClick={() => {setFiltro(''); setCategoriaActiva('Todos');}} className="mt-6 text-emerald-600 font-bold hover:underline">Limpiar filtros</button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        {/* SECTION CONTACT / CTA */}
        <section id="contacto" className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-neutral-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] -mr-40 -mt-40" />
              
              <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-10">
                    ¿Hablamos <br />
                    de tu <span className="text-emerald-500">finca?</span>
                  </h2>
                  <p className="text-neutral-400 text-xl mb-12 leading-relaxed font-medium">
                    Asesoría personalizada sobre dosificación, nuevos laboratorios o pedidos a volumen. Estamos listos para potenciar tu productividad.
                  </p>
                  
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-neutral-800 rounded-3xl flex items-center justify-center text-emerald-500 shrink-0">
                        <Phone className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Central de Pedidos</p>
                        <p className="text-2xl font-black">+57 (310) 999 0000</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-neutral-800 rounded-3xl flex items-center justify-center text-sky-500 shrink-0">
                        <Mail className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Escríbenos</p>
                        <p className="text-2xl font-black">ventas@agricovet.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                   <form 
                    className="space-y-6" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const msg = `Hola Agricovet, soy ${form.name.value}. Busco información sobre: ${form.message.value}`;
                      window.open(`https://wa.me/573109990000?text=${encodeURIComponent(msg)}`);
                    }}
                  >
                    <div>
                      <input name="name" type="text" placeholder="Nombre completo" required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white font-medium" />
                    </div>
                    <div>
                      <input name="email" type="email" placeholder="Correo electrónico" required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white font-medium" />
                    </div>
                    <div>
                      <textarea name="message" rows={4} placeholder="¿Qué insumos necesitas hoy?" required className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-white font-medium resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full py-6 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 group">
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
      <footer className="py-20 bg-neutral-950 text-neutral-500 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-16 opacity-50 grayscale">
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-neutral-400" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase">Agricovet Insumos</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] mb-4">Hecho para el campo moderno</p>
          <p className="text-[10px] text-neutral-700">© 2024 Agricovet Ltda. Salud Animal e Insumos Premium.</p>
        </div>
      </footer>
    </div>
  );
}

// SUB-COMPONENTS
function ChannelCard({ icon, title, subtitle, description, theme, link }: { icon: ReactNode, title: string, subtitle: string, description: string, theme: string, link: string }) {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
  };

  return (
    <motion.a 
      href={link}
      target="_blank"
      whileHover={{ y: -10 }}
      className="group p-10 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500"
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

function ProductCard({ producto, index, adminMode, isUploading, onImageChange }: { 
  producto: Producto, 
  index: number, 
  adminMode: boolean, 
  isUploading: boolean,
  onImageChange: (e: ChangeEvent<HTMLInputElement>, id: string | number) => void | Promise<void>,
  key?: any
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stockLimit = 5;
  const isBajoPedido = typeof producto.Existencias === 'string' && producto.Existencias.toLowerCase().includes('pedido') || (typeof producto.Existencias === 'number' && producto.Existencias < stockLimit);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-emerald-100 transition-all group flex flex-col h-full relative"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 group/img">
        {(!producto.imagen_url && !producto.Imagen) && adminMode ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 border-2 border-dashed border-neutral-200 group-hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-12 h-12 text-neutral-300 mb-2" />
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Sin Imagen</span>
            <span className="text-[8px] text-neutral-400 mt-1">Haz clic para subir</span>
          </div>
        ) : (
          <img 
            src={producto.imagen_url || producto.Imagen || "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&q=80&w=600"} 
            alt={producto.Nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        )}
        
        {/* Badges stage */}
        <div className="absolute inset-x-4 top-4 flex justify-between items-start">
          {producto.resaltado && (
            <div className="bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl">
              Focus Product
            </div>
          )}
        </div>

        {/* Admin Image Control Overlay */}
        {adminMode && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-center p-6">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <p className="text-white font-black uppercase tracking-widest text-xs">Sincronizando Cloud...</p>
              </>
            ) : (
              <>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-neutral-900 cursor-pointer hover:scale-110 transition-transform shadow-xl"
                >
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-white font-black uppercase tracking-widest text-[10px]">Actualizar en Supabase</p>
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
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-widest">
            {producto.Categoría}
          </span>
          <span className="text-[9px] text-neutral-300 font-mono font-bold tracking-tighter">
            PROD_ID_{producto.Identificación}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-neutral-900 mb-6 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2">
          {producto.Nombre}
        </h3>
        
        <div className="mt-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] ${isBajoPedido ? 'text-orange-500' : 'text-emerald-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isBajoPedido ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
              {isBajoPedido ? 'Bajo Pedido' : 'En Existencia'}
            </div>
            
            {producto.Precio && (
              <span className="text-xl font-black text-neutral-900 tracking-tighter">
                ${producto.Precio}
              </span>
            )}
          </div>

          <button 
            onClick={() => window.open(`https://wa.me/573109990000?text=${encodeURIComponent(`¡Hola! Quisiera info sobre el producto: ${producto.Nombre} (Ref: ${producto.Identificación})`)}`)}
            className="w-full py-4 bg-neutral-50 text-neutral-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Consultar <MessageCircle className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
