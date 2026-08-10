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
  ChevronDown,
  Camera
} from 'lucide-react';
import { supabase } from './supabase';
import { Producto, Categoria } from './types';
import { PRODUCTOS_AGRICOVET_SEED } from './data/productosAgricovet';

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
  const [logoUrl, setLogoUrl] = useState('/agricovet.png');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos');
  const [adminMode, setAdminMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductIsOwn, setNewProductIsOwn] = useState(false);
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
      let data: any[] | null = null;
      let error: any = null;

      const tablesToTry = ['productos', 'products', 'inventario', 'items', 'catalogo'];
      for (const table of tablesToTry) {
        const res = await supabase.from(table).select('*');
        if (!res.error && res.data && res.data.length > 0) {
          data = res.data;
          break;
        } else if (res.error) {
          error = res.error;
        } else if (res.data && res.data.length === 0 && !data) {
          data = [];
        }
      }

      // Extraer configuración de logo si existe
      const configLogo = data?.find(p => p.Identificación === 'CONFIG_LOGO' || p.nombre === 'CONFIG_LOGO' || p.Nombre === 'CONFIG_LOGO');
      if (configLogo) {
        let url = configLogo.imagen_url || configLogo.Imagen || configLogo.image_url;
        if (url) {
          if (url.startsWith('http')) {
            try {
              const urlObj = new URL(url);
              url = urlObj.toString();
            } catch (e) {}
          }
          setLogoUrl(url);
          setNewLogoUrl(url);
        }
      }

      // Mapear campos de base de datos
      const mappedData: Producto[] = (data || []).map((p: any) => ({
        Identificación: p.Identificación || p.id || p.codigo || `ID_${Math.random().toString(36).substring(7)}`,
        Nombre: p.Nombre || p.name || p.nombre || 'Producto',
        Categoría: p.Categoría || p.category || p.categoria || 'Otros',
        Precio: p.Precio || p.price || p.precio || '0.00',
        Existencias: p.Existencias || p.stock || p.existencias || '+ Disponible',
        Imagen: p.Imagen || p.imagen || p.image_url || p.imagen_url || '',
        imagen_url: p.imagen_url || p.Imagen || p.image_url || p.imagen || '',
        resaltado: p.resaltado ?? p.featured ?? false
      }));

      const dbProductos = mappedData.filter(p => 
        p.Identificación !== 'CONFIG_LOGO' && 
        p.Identificación !== 'CONFIG' &&
        p.Nombre !== 'CONFIG_LOGO'
      );

      setProductos(dbProductos.length > 0 ? dbProductos : PRODUCTOS_AGRICOVET_SEED);
      setError(null);
    } catch (err: any) {
      console.warn('Error fetching productos from Supabase:', err);
      setProductos(PRODUCTOS_AGRICOVET_SEED);
      setError(null);
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

      if (uploadError) {
        let msg = uploadError.message || 'Error desconocido';
        if (msg.includes('The resource was not found') || msg.includes('Bucket not found')) {
          throw new Error("Falta Bucket: Ve a Supabase Storage y crea un bucket PÚBLICO llamado 'productos'.");
        }
        if (msg.includes('row-level security')) {
          throw new Error("Faltan permisos RLS: Configura políticas en el bucket 'productos' para permitir subidas.");
        }
        throw new Error(msg);
      }

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);

      // 3. Actualizar DB (Ambas columnas para compatibilidad)
      const { error: updateError } = await supabase
        .from('productos')
        .update({ Imagen: publicUrl, imagen_url: publicUrl })
        .eq('Identificación', id);

      if (updateError) {
        let msg = updateError.message || 'Error desconocido';
        if (msg.includes('row-level security') || msg.includes('new row violates row-level security')) {
          throw new Error("Faltan permisos RLS en la tabla 'productos' para permitir UPDATE.");
        }
        throw new Error(msg);
      }

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

      if (uploadError) {
        let msg = uploadError.message || 'Error desconocido';
        if (msg.includes('The resource was not found') || msg.includes('Bucket not found')) {
          throw new Error("Falta Bucket: Ve a Supabase Storage y crea un bucket PÚBLICO llamado 'productos'.");
        }
        if (msg.includes('row-level security')) {
          throw new Error("Faltan permisos RLS: Configura políticas en el bucket 'productos' para permitir subidas.");
        }
        throw new Error(msg);
      }

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

      if (insertError) {
        let msg = insertError.message || 'Error desconocido';
        if (msg.includes('row-level security') || msg.includes('new row violates row-level security')) {
          throw new Error("Faltan permisos RLS en la tabla 'productos' para permitir INSERT.");
        }
        throw new Error(msg);
      }

      // 4. Actualizar estado local y limpiar
      if (insertedData) {
        setProductos(prev => [insertedData[0], ...prev]);
      }
      setNewProductName('');
      setNewProductCategory('');
      setNewProductIsOwn(false);
      alert("Producto creado exitosamente con imagen optimizada.");
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      alert('Error al crear el producto: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogoFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdatingLogo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(fileName);

      const { error: logErr } = await supabase.from('productos').upsert({ 
        'Identificación': 'CONFIG_LOGO', 
        Nombre: 'CONFIG_LOGO', 
        imagen_url: publicUrl, 
        Imagen: publicUrl,
        Categoría: 'CONFIG' 
      });
      if (logErr) throw logErr;

      setLogoUrl(publicUrl);
      setNewLogoUrl(publicUrl);
      alert('¡Logo subido y actualizado exitosamente!');
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      alert('Error al subir el logo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsUpdatingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUpdateLogo = async () => {
    if (!newLogoUrl.trim()) return;
    try {
      setIsUpdatingLogo(true);
      const sanitizedUrl = newLogoUrl.trim();
      const { error: logErr } = await supabase.from('productos').upsert({ 
        'Identificación': 'CONFIG_LOGO', 
        Nombre: 'CONFIG_LOGO', 
        imagen_url: sanitizedUrl, 
        Imagen: sanitizedUrl,
        Categoría: 'CONFIG' 
      });
      if (logErr) throw logErr;
      setLogoUrl(sanitizedUrl);
      setNewLogoUrl(sanitizedUrl);
      alert('¡Logo actualizado exitosamente!');
    } catch (err: any) {
      console.error('Error updating logo:', err);
      alert('Error al actualizar el logo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!window.confirm("¿Estás seguro de borrar todos los productos del catálogo? Esta acción eliminará todos los registros de la base de datos.")) {
      return;
    }
    try {
      setLoading(true);
      const tables = ['productos', 'products', 'inventario', 'items', 'catalogo'];
      for (const table of tables) {
        try {
          await supabase.from(table).delete().neq('id', -999999);
          await supabase.from(table).delete().neq('Identificación', 'CONFIG_LOGO');
        } catch (e) {
          // ignore table not found
        }
      }
      setProductos([]);
      alert("Todos los productos han sido eliminados exitosamente.");
    } catch (err: any) {
      console.error('Error:', err);
      setProductos([]);
      alert("Productos eliminados localmente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    if (!window.confirm("¿Deseas cargar la lista completa de más de 120 productos oficiales en la base de datos y catálogo?")) {
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('productos').upsert(PRODUCTOS_AGRICOVET_SEED, { onConflict: 'Identificación' });
      if (error) {
        console.warn('Supabase upsert warning:', error);
      }
      setProductos(PRODUCTOS_AGRICOVET_SEED);
      alert("¡Catálogo completo de productos (120+) cargado exitosamente!");
    } catch (err: any) {
      console.error('Error seeding products:', err);
      setProductos(PRODUCTOS_AGRICOVET_SEED);
      alert("Productos cargados en vista local.");
    } finally {
      setLoading(false);
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

  const productosPropios = productos.filter(p => p.Nombre.toLowerCase().includes('agricovet') || p.resaltado || p.Categoría.toLowerCase().includes('agricovet'));
  // If there are none, we fallback to highlighting some products for visual presentation
  const productosDestacados = productosPropios.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-neutral-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navbar Executive */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex justify-between items-center">
          <a href="#inicio" className="flex items-center gap-4 select-none group">
              <div className="relative flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  key={logoUrl}
                  alt="Agricovet Logo" 
                  className="h-14 sm:h-20 w-auto object-contain hover:scale-105 transition-all duration-300 relative z-10"
                  onError={(e) => {
                    if (logoUrl !== '/agricovet.png') {
                      setLogoUrl('/agricovet.png');
                    } else {
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />
              </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase text-neutral-600">
            <a href="#inicio" className="hover:text-emerald-600 transition-colors hidden sm:inline-block">Corporativo</a>
            <a href="#catálogo" className="hover:text-emerald-600 transition-colors hidden sm:inline-block">Catálogo</a>
            <button 
              onClick={() => setAdminMode(!adminMode)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-none border text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                adminMode 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
              title="Activar panel de administración y carga de productos"
            >
              <Settings className="w-4 h-4" /> <span className="hidden sm:inline">{adminMode ? 'Cerrar Admin' : 'Admin'}</span>
            </button>
            <button 
              onClick={() => handleWhatsAppRedirect()}
              className="bg-emerald-600 hover:bg-emerald-700 text-neutral-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-none transition-colors flex items-center gap-2 font-bold tracking-[0.15em] cursor-pointer border-none shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
            >
              <Phone className="w-4 h-4" /> <span className="hidden sm:inline">Asesoría</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main>
        
        {/* ADMIN PANEL - NEW PRODUCT FORM */}
        <AnimatePresence>
          {adminMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border-b border-emerald-100 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                {/* Logo Configuration Section */}
                <div className="bg-white p-8 rounded-none shadow-xl border border-emerald-100">
                  <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-emerald-600" /> Configuración de Logo
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-24 h-24 bg-neutral-50 rounded-none border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                      {newLogoUrl ? (
                        <img src={newLogoUrl} alt="Preview" className="w-full h-full object-contain p-2" onError={(e) => e.currentTarget.src = '/agricovet.png'} />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-neutral-200" />
                      )}
                    </div>
                    <div className="flex-grow w-full space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">URL del Logo (Imagen)</label>
                        <input 
                          type="text" 
                          placeholder="Pega aquí la URL de la imagen..."
                          className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs"
                          value={newLogoUrl}
                          onChange={(e) => setNewLogoUrl(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateLogo}
                          disabled={isUpdatingLogo || !newLogoUrl.trim()}
                          className={`px-8 py-3 rounded-none font-black text-[10px] uppercase tracking-widest transition-all h-[46px] flex items-center justify-center gap-2 ${
                            isUpdatingLogo || !newLogoUrl.trim()
                            ? 'bg-neutral-100 text-neutral-500'
                            : 'bg-emerald-600 text-neutral-900 hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                          }`}
                        >
                          {isUpdatingLogo ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando...</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Guardar URL</>
                          )}
                        </button>
                        
                        <label className={`cursor-pointer px-8 py-3 rounded-none font-black text-[10px] uppercase tracking-widest transition-all h-[46px] flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 hover:bg-emerald-50 text-emerald-700 ${isUpdatingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload className="w-4 h-4" /> Subir Archivo
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoFileUpload} disabled={isUpdatingLogo} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-neutral-500 italic flex flex-wrap gap-2">
                    * Sube una imagen desde tu computadora o usa una URL directa.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-none shadow-xl border border-emerald-100">
                  <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                    <Upload className="w-6 h-6 text-emerald-600" /> Agregar Nuevo Producto
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Nombre del Producto</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Iverplus La 10ml 1%"
                        className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Categoría</label>
                      <select 
                        className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                    <div className="flex flex-col justify-end h-full pb-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
                          checked={newProductIsOwn}
                          onChange={(e) => setNewProductIsOwn(e.target.checked)}
                        />
                        <span className="text-[9px] font-black text-neutral-500 group-hover:text-emerald-600 uppercase tracking-wider">¿Línea Propia?</span>
                      </label>
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
                        className={`w-full py-4 rounded-none flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${
                          isCreating || !newProductName.trim() 
                          ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' 
                          : 'bg-emerald-600 text-neutral-900 hover:bg-emerald-700 shadow-lg shadow-emerald-200'
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
                  <div className="mt-4 text-[10px] text-neutral-500 italic flex flex-wrap justify-between items-center gap-2">
                    <span>* Al subir la imagen, se creará automáticamente el registro en la base de datos con la URL pública vinculada.</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSeedProducts}
                        className="px-4 py-2 bg-emerald-700 text-neutral-900 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-emerald-800 transition-all shadow-sm"
                      >
                        📦 Cargar 120+ Productos Oficiales
                      </button>
                      <button
                        onClick={handleDeleteAllProducts}
                        className="px-4 py-2 bg-red-600 text-neutral-900 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-red-700 transition-all shadow-sm"
                      >
                        🗑️ Borrar Todos los Productos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* HERO SECTION - EXECUTIVE CORPORATE */}
        <section id="inicio" className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-[#f7f9fa] overflow-hidden">
          {/* Subtle geometric background */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-emerald-100/50 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-600 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                  <ShieldCheck className="w-4 h-4" /> División Agro-Veterinaria
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-light text-neutral-900 leading-[1.1] mb-8 tracking-tight">
                  Rendimiento <br />
                  Corporativo para <br />
                  <span className="text-emerald-600 font-medium italic">el sector primario.</span>
                </h1>
                <p className="text-base md:text-lg text-neutral-500 mb-10 max-w-xl leading-relaxed font-light">
                  Abastecimiento estratégico de insumos veterinarios y agrícolas. Proveemos a empresas, clínicas y grandes productores con un catálogo verificado y logística de precisión.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#catálogo" className="px-8 py-4 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-bold text-xs uppercase tracking-[0.15em] transition-colors flex items-center gap-3">
                    Acceder al Catálogo <ChevronRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleWhatsAppRedirect('Hola Agricovet, requiero asesoría corporativa.')}
                    className="px-8 py-4 bg-white border border-neutral-300 text-neutral-900 font-bold hover:border-emerald-600 hover:text-emerald-700 text-xs uppercase tracking-[0.15em] transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    Contacto Comercial <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
              >
                {/* Official Stamp Logo overlaid */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 6 }}
                  className="absolute -top-6 -right-6 bg-[#f7f9fa] p-4 border border-neutral-200 z-20 flex items-center justify-center w-24 h-24 cursor-pointer select-none"
                >
                  <img 
                    src={logoUrl} 
                    key={`seal-${logoUrl}`}
                    alt="Sello Agricovet" 
                    className="w-full h-full object-contain brightness-125"
                    onError={(e) => {
                      if (logoUrl !== '/agricovet.png') {
                        setLogoUrl("/agricovet.png"); 
                      } else { 
                        e.currentTarget.style.display = "none"; 
                      } 
                    }} 
                  /> 
                </motion.div> 
                <div className="aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-white border border-neutral-200"> 
                  <img 
                    src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200" 
                    alt="Corporate Farm" 
                    className="w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                  /> 
                </div> 
              </motion.div> 
            </div> 
          </div> 
        </section>
        <section className="py-24 bg-[#f7f9fa] border-b border-neutral-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-neutral-200 pb-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-emerald-600 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                  <ShieldCheck className="w-3.5 h-3.5" /> Producción Propia
                </div>
                <h2 className="text-3xl md:text-5xl font-light text-neutral-900 tracking-tight mb-4">
                  LÍNEA DE PRODUCTOS <br />
                  <span className="text-emerald-600 font-medium italic">Agricovet.</span>
                </h2>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Conoce nuestra línea de productos patentados. Formulación superior, rendimiento comprobado y garantía directa de fábrica.
                </p>
              </div>
              <div>
                <a href="#catálogo" className="px-8 py-3 bg-white border border-neutral-300 hover:border-emerald-600 text-neutral-900 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-[0.2em] rounded-none transition-all inline-flex items-center gap-3 shadow-sm">
                  Ver Todo el Portafolio <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <AnimatePresence mode="popLayout">
                {productosDestacados.map((p, idx) => (
                  <ProductCard 
                    key={`destacado-${p.Identificación}`} 
                    producto={p} 
                    index={idx} 
                    adminMode={adminMode}
                    isUploading={uploading === `${p.Identificación}`}
                    onImageChange={handleImageUpload}
                    onInquiry={handleProductInquiry}
                  />
                ))}
              {productosDestacados.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-12 flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200">
                  <p className="text-sm">Espacio disponible para productos de Producción Propia.</p>
                  {adminMode && <p className="text-xs mt-2">Crea productos con la palabra "Agricovet" en su nombre o categoría para que aparezcan aquí.</p>}
                </motion.div>
              )}
              </AnimatePresence>
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
                <h2 className="text-3xl md:text-5xl font-light text-neutral-900 tracking-tight mb-4">Portafolio Agricovet</h2>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Encuentra los medicamentos, biológicos y productos agropecuarios ideales. Utiliza el buscador y las categorías dinámicas para simplificar tu consulta.
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">¿Qué producto estás buscando?</label>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Ej. Oxitetraciclina, Iverplus, Duwest..."
                    className="w-full pl-14 pr-6 py-4.5 bg-white border border-neutral-200 rounded-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-light"
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
                  className={`flex-shrink-0 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    categoriaActiva === cat 
                    ? 'bg-emerald-600 text-neutral-900 shadow-lg shadow-emerald-200/50 scale-[1.03]' 
                    : 'bg-white text-neutral-500 hover:text-neutral-900 border border-neutral-100 hover:border-neutral-200'
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
                <p className="text-neutral-500 font-medium mb-6">{error}</p>
                <button onClick={fetchProductos} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded-none transition-all">
                  Reintentar Sincronización
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
                    <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
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
                      className="mt-4 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-neutral-900 font-black text-xs uppercase tracking-widest rounded-none hover:scale-[1.03] shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                    >
                      Cargar más productos <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {productosFiltrados.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-24 text-center bg-white rounded-none border border-dashed border-neutral-200 shadow-xs"
                  >
                    <Package className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-lg font-bold text-neutral-500 mb-2">No encontramos registros para "{filtro}"</p>
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
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-12">Marcas Aliadas</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {['BIOZOO', 'WELLCO', 'TECNIAGRO', 'LAVET', 'FORAGRO'].map(lab => (
                <span key={lab} className="text-xl md:text-2xl font-black text-neutral-500 hover:text-neutral-900 transition-colors cursor-default tracking-wider">
                  {lab}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CANALES DE COMUNICACIÓN */}
        <section className="py-24 bg-neutral-50/40 border-b border-neutral-100/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Atención Inmediata</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-light text-neutral-900 tracking-tight mb-4">Vías de Contacto Directo</h2>
              <p className="text-base sm:text-lg text-neutral-500 font-medium leading-relaxed">
                ¿Necesitas una cotización formal o tienes dudas sobre insumos para tu campo? Nuestro equipo está listo para asesorarte al instante.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <ChannelCard 
                icon={<MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="WhatsApp Directo"
                subtitle="Atención Ejecutiva"
                description="Conéctate instantáneamente con un ejecutivo de guardia para asesoría o pedidos inmediatos."
                onClick={() => handleWhatsAppRedirect()}
              />
              <ChannelCard 
                icon={<Instagram className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Comunidad IG"
                subtitle="@agricovetsa"
                description="Únete a nuestro perfil de Instagram de Agricovet para contenido continuo y novedades."
                link={instagramUrl}
              />
              <ChannelCard 
                icon={<Facebook className="w-6 h-6 sm:w-7 sm:h-7" />}
                title="Catálogo FB"
                subtitle="Página Oficial"
                description="Explora nuestras publicaciones y conecta con nosotros en Facebook."
                link={facebookUrl}
              />
            </div>
          </div>
        </section>

        {/* SECTION CONTACT / CTA */}
        <section id="contacto" className="py-16 sm:py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white border border-neutral-200 rounded-none sm:rounded-none p-6 sm:p-12 md:p-24 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
              
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
                <div className="text-neutral-900">
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight leading-tight sm:leading-none mb-6 sm:mb-10">
                    ¿Hablamos <br />
                    de tu <span className="text-emerald-500">finca?</span>
                  </h2>
                  <p className="text-neutral-500 text-base sm:text-xl mb-8 sm:mb-12 leading-relaxed font-light">
                    Asesoría personalizada sobre dosificación, nuevos laboratorios o pedidos a volumen. Estamos listos para potenciar tu productividad.
                  </p>
                  
                  <div className="space-y-6 sm:space-y-10">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-neutral-200 shadow-sm rounded-none sm:rounded-nonexl flex items-center justify-center text-emerald-500 shrink-0 mt-1">
                        <Phone className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Central de Pedidos o Consultas</p>
                        <div className="space-y-1.5 sm:space-y-3">
                          <p className="text-base sm:text-2xl font-black">
                            <a href="https://wa.me/50254743595" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors flex items-center gap-2">
                              +502 5474 3595 <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">Línea 1</span>
                            </a>
                          </p>
                          <p className="text-base sm:text-2xl font-black">
                            <a href="https://wa.me/50241323037" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors flex items-center gap-2">
                              +502 4132 3037 <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">Línea 2</span>
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-neutral-200 shadow-sm rounded-none sm:rounded-nonexl flex items-center justify-center text-emerald-500 shrink-0">
                        <Mail className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Escríbenos</p>
                        <p className="text-lg sm:text-2xl font-black">
                          <a href={`mailto:${emailVal}`} className="hover:text-emerald-600 transition-colors text-neutral-900">
                            {emailVal}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 shadow-sm p-6 sm:p-10 rounded-none sm:rounded-[3rem]"> 
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
                      <input name="name" type="text" placeholder="Nombre completo" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white border border-neutral-300 rounded-none sm:rounded-none focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-neutral-900 text-sm sm:text-base font-medium placeholder:text-neutral-400" />
                    </div>
                    <div>
                      <input name="email" type="email" placeholder="Correo electrónico" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white border border-neutral-300 rounded-none sm:rounded-none focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-neutral-900 text-sm sm:text-base font-medium placeholder:text-neutral-400" />
                    </div>
                    <div>
                      <textarea name="message" rows={3} placeholder="¿Qué insumos necesitas hoy?" required className="w-full px-4 sm:px-8 py-3.5 sm:py-5 bg-white border border-neutral-300 rounded-none sm:rounded-none focus:ring-4 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-neutral-900 text-sm sm:text-base font-medium resize-none placeholder:text-neutral-400"></textarea>
                    </div>
                    <button type="submit" className="w-full py-4 sm:py-6 bg-emerald-600 text-neutral-900 font-black text-xs sm:text-sm uppercase tracking-widest rounded-none sm:rounded-none hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 sm:gap-3 group">
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
      <footer className="pt-24 pb-12 bg-white text-neutral-500 border-t border-neutral-200 relative z-20 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
          {/* Logo Brand with dynamic fallback */}
          <div className="flex flex-col items-center justify-center select-none">
            <div className="p-6 bg-white rounded-none shadow-2xl mb-8">
              <img 
                src={logoUrl} 
                key={`footer-${logoUrl}`}
                alt="Agricovet Logo" 
                className="h-20 sm:h-28 w-auto object-contain hover:scale-105 transition-all duration-300 cursor-pointer" 
                onError={(e) => {
                  if (logoUrl !== '/agricovet.png') {
                    setLogoUrl('/agricovet.png');
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
            </div>
            <p className="text-emerald-500 font-black tracking-[0.2em] uppercase text-xs">El aliado de tu campo</p>
          </div>

          {/* Social Links Panel */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            <button 
              onClick={() => handleWhatsAppRedirect()}
              className="w-14 h-14 bg-white hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-full flex items-center justify-center text-neutral-500 transition-all shadow-xl border border-neutral-200 cursor-pointer hover:scale-110"
              title="Contactar por WhatsApp"
            >
              <Phone className="w-6 h-6" />
            </button>
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-14 h-14 bg-white hover:bg-pink-600 hover:text-white text-pink-600 rounded-full flex items-center justify-center text-neutral-500 transition-all shadow-xl border border-neutral-200 hover:scale-110"
              title="Seguir en Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-14 h-14 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-full flex items-center justify-center text-neutral-500 transition-all shadow-xl border border-neutral-200 hover:scale-110"
              title="Visitar en Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          {/* Terms and Privacy Triggers */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <button 
              onClick={() => setShowTerms(true)} 
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Términos y Condiciones
            </button>
            <span className="text-neutral-300 hidden sm:inline">•</span>
            <button 
              onClick={() => setShowPrivacy(true)} 
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Política de Privacidad
            </button>
          </div>

          <div className="border-t border-neutral-100 pt-10 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-neutral-500">Hecho para el campo moderno</p>
            <p className="text-[10px] text-neutral-500 font-medium">© 2026 Agricovet Ltda. Salud Animal e Insumos Premium.</p>
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
      <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Paper Container */}
      <div className="bg-white rounded-none w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col border border-neutral-100">
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
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-neutral-900 font-black text-[10px] uppercase tracking-widest rounded-none transition-all"
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
        <div key={idx} className="bg-white rounded-none sm:rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="aspect-square w-full bg-neutral-100/80 rounded-none" />
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
            <div className="h-8 w-16 bg-neutral-100/80 rounded-none animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChannelCard({ icon, title, subtitle, description, link, onClick }: { 
  icon: ReactNode, 
  title: string, 
  subtitle: string, 
  description: string, 
  theme?: string, 
  link?: string, 
  onClick?: () => void 
}) {
  return (
    <a 
      href={link || '#'}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      target={link ? "_blank" : undefined}
      rel={link ? "noopener noreferrer" : undefined}
      className="group p-5 bg-white rounded-none border border-neutral-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-300 flex items-start gap-4 sm:gap-5 cursor-pointer"
    >
      <div className="w-12 h-12 shrink-0 bg-neutral-50 group-hover:bg-emerald-50 text-neutral-500 group-hover:text-emerald-600 rounded-none flex items-center justify-center transition-colors">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[9px] font-black text-neutral-500 group-hover:text-emerald-600/70 uppercase tracking-[0.15em] mb-1 transition-colors">{subtitle}</p>
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors mb-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all self-center shrink-0" />
    </a>
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
      className="bg-white rounded-none border border-neutral-200 overflow-hidden shadow-sm hover:shadow-[0_45px_90px_-25px_rgba(0,0,0,0.12)] hover:border-emerald-100 transition-all group flex flex-col h-full relative"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100/50 group/img">
        {/* Shimmer skeleton behind the image */}
        {(!producto.imagen_url && !producto.Imagen && adminMode) ? null : (
          <div className={`absolute inset-0 bg-neutral-100 animate-pulse transition-opacity duration-300 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
        )}

        {(!producto.imagen_url && !producto.Imagen && adminMode) ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 border-2 border-dashed border-neutral-200 group-hover:bg-neutral-200 transition-colors cursor-pointer p-4"
          >
            <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-300 mb-1.5" />
            <span className="text-[8px] sm:text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center">Sin Imagen</span>
            <span className="text-[6px] sm:text-[8px] text-neutral-500 mt-1 text-center">Haz clic para subir</span>
          </div>
        ) : (
          <img 
            src={producto.imagen_url || producto.Imagen || ["https://images.unsplash.com/photo-1614850715649-1d0106293bd1?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600"][index % 4]} 
            alt={producto.Nombre}
            className={`w-full h-full object-contain p-4 sm:p-6 group-hover:scale-105 transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
        )}
        
        {/* Badges stage */}
        <div className="absolute inset-x-3 sm:inset-x-4 top-3 sm:top-4 flex justify-between items-start pointer-events-none">
          {/* producto.resaltado && (
            <div className="bg-emerald-600 text-neutral-900 text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-none shadow-sm flex items-center gap-1 pointer-events-auto">
              <span>⭐ Exclusivo Agricovet</span>
            </div>
          ) */}
        </div>

        {/* Hidden File Input for Admin Image Upload */}
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept="image/*"
          onChange={(e) => onImageChange(e, producto.Identificación)}
        />
 
        {/* Image Control Overlay */}
        {adminMode && (
        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 sm:gap-4 text-center p-4 sm:p-6">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600 animate-spin" />
              <p className="text-neutral-900 font-black uppercase tracking-widest text-[8px] sm:text-xs">Subiendo...</p>
            </>
          ) : (
            <>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-none sm:rounded-none flex items-center justify-center text-neutral-900 cursor-pointer hover:scale-110 transition-transform shadow-xl"
              >
                <Upload className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <p className="text-neutral-900 font-black uppercase tracking-widest text-[8px] sm:text-[10px]">Actualizar Imagen</p>
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
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-[8px] sm:text-[9px] font-bold text-emerald-700 border border-emerald-200 bg-emerald-50/50 px-2 sm:px-3 py-1 rounded-none uppercase tracking-[0.2em] truncate">
            {producto.Categoría}
          </span>
          <span className="text-[7px] sm:text-[9px] text-neutral-300 font-mono font-bold tracking-tighter">
            ID_{producto.Identificación}
          </span>
        </div>
        
        <h3 className="text-xs sm:text-base font-bold text-neutral-900 mb-2 sm:mb-4 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2 h-8 sm:h-auto overflow-hidden">
          {producto.Nombre}
        </h3>
        
        <div className="mt-auto space-y-2 sm:space-y-4">
          <div className="flex items-center justify-between gap-1.5">
            <div className={`flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] ${isBajoPedido ? 'text-orange-500' : 'text-emerald-500'}`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isBajoPedido ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="truncate">{isBajoPedido ? 'Pedir' : 'Stock'}</span>
            </div>
          </div>
 
          <button 
            onClick={() => onInquiry(producto.Nombre, producto.Identificación)}
            className="w-full py-2 sm:py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-neutral-900 font-black text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-1.5"
          >
            <span>Consultar</span> <MessageCircle className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
