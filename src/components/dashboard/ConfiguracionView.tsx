import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Bell, Shield, Database, Palette } from "lucide-react";
import { ManagementSection } from "./ManagementSection";
import {
  getColoresDiseno,
  createColorDiseno,
  updateColorDiseno,
  deleteColorDiseno,
  getColoresLuz,
  createColorLuz,
  updateColorLuz,
  deleteColorLuz,
  getTipos,
  createTipo,
  updateTipo,
  deleteTipo,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getUbicaciones,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
  getWatts,
  createWatt,
  updateWatt,
  deleteWatt,
  getTamanos,
  createTamano,
  updateTamano,
  deleteTamano,
  ManagementItem
} from "@/api/ManagementSectionApi";

export function ConfiguracionView() {
  // Estados para cada tipo de configuración
  const [coloresDiseno, setColoresDiseno] = useState<string[]>([]);
  const [coloresLuz, setColoresLuz] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  const [watts, setWatts] = useState<string[]>([]);
  const [tamaños, setTamaños] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de carga para cada sección
  const [loadingStates, setLoadingStates] = useState({
    coloresDiseno: false,
    coloresLuz: false,
    tipos: false,
    categorias: false,
    ubicaciones: false,
    watts: false,
    tamanos: false
  });

  // Estados para controlar qué formularios están abiertos
  const [openForms, setOpenForms] = useState({
    coloresDiseno: false,
    coloresLuz: false,
    tipos: false,
    categorias: false,
    ubicaciones: false,
    watts: false,
    tamanos: false
  });

  // Función para verificar si algún formulario está abierto
  const isAnyFormOpen = () => {
    return Object.values(openForms).some(isOpen => isOpen);
  };

  // Manejar el evento de popstate (botón atrás del navegador)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isAnyFormOpen()) {
        // Prevenir la navegación hacia atrás
        event.preventDefault();
        // Cerrar todos los formularios
        setOpenForms({
          coloresDiseno: false,
          coloresLuz: false,
          tipos: false,
          categorias: false,
          ubicaciones: false,
          watts: false,
          tamanos: false
        });
        // Agregar una nueva entrada al historial para mantener la posición actual
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Agregar una entrada inicial al historial
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [openForms]);

  // Función para actualizar el estado de carga de una sección
  const setSectionLoading = (section: keyof typeof loadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [section]: isLoading
    }));
  };

  // Función para abrir/cerrar formularios
  const toggleForm = (section: keyof typeof openForms, isOpen: boolean) => {
    setOpenForms(prev => ({
      ...prev,
      [section]: isOpen
    }));

    // Si se está abriendo un formulario, agregar una entrada al historial
    if (isOpen) {
      window.history.pushState({ formOpen: true }, '');
    }
  };

  // Función para cerrar un formulario específico
  const handleCloseForm = (section: keyof typeof openForms) => {
    toggleForm(section, false);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los datos en paralelo
        const [
          coloresDisenoData,
          coloresLuzData,
          tiposData,
          categoriasData,
          ubicacionesData,
          wattsData,
          tamanosData
        ] = await Promise.all([
          getColoresDiseno(),
          getColoresLuz(),
          getTipos(),
          getCategorias(),
          getUbicaciones(),
          getWatts(),
          getTamanos()
        ]);

        // Mapear a arrays de strings (solo los nombres)
        setColoresDiseno(coloresDisenoData.map(item => item.nombre));
        setColoresLuz(coloresLuzData.map(item => item.nombre));
        setTipos(tiposData.map(item => item.nombre));
        setCategorias(categoriasData.map(item => item.nombre));
        setUbicaciones(ubicacionesData.map(item => item.nombre));
        setWatts(wattsData.map(item => item.nombre));
        setTamaños(tamanosData.map(item => item.nombre));
        
      } catch (error) {
        console.error("Error loading configuration data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers para Colores de Diseño
  const handleAddColorDiseno = async (name: string) => {
    setSectionLoading('coloresDiseno', true);
    try {
      await createColorDiseno({ nombre: name });
      const updatedData = await getColoresDiseno();
      setColoresDiseno(updatedData.map(item => item.nombre));
      handleCloseForm('coloresDiseno');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresDiseno', false);
    }
  };

  const handleEditColorDiseno = async (oldName: string, newName: string) => {
    setSectionLoading('coloresDiseno', true);
    try {
      const currentData = await getColoresDiseno();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateColorDiseno(itemToEdit.id, { nombre: newName });
        const updatedData = await getColoresDiseno();
        setColoresDiseno(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresDiseno', false);
    }
  };

  const handleDeleteColorDiseno = async (name: string) => {
    setSectionLoading('coloresDiseno', true);
    try {
      const currentData = await getColoresDiseno();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteColorDiseno(itemToDelete.id);
        const updatedData = await getColoresDiseno();
        setColoresDiseno(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresDiseno', false);
    }
  };

  // Handlers para Colores de Luz
  const handleAddColorLuz = async (name: string) => {
    setSectionLoading('coloresLuz', true);
    try {
      await createColorLuz({ nombre: name });
      const updatedData = await getColoresLuz();
      setColoresLuz(updatedData.map(item => item.nombre));
      handleCloseForm('coloresLuz');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresLuz', false);
    }
  };

  const handleEditColorLuz = async (oldName: string, newName: string) => {
    setSectionLoading('coloresLuz', true);
    try {
      const currentData = await getColoresLuz();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateColorLuz(itemToEdit.id, { nombre: newName });
        const updatedData = await getColoresLuz();
        setColoresLuz(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresLuz', false);
    }
  };

  const handleDeleteColorLuz = async (name: string) => {
    setSectionLoading('coloresLuz', true);
    try {
      const currentData = await getColoresLuz();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteColorLuz(itemToDelete.id);
        const updatedData = await getColoresLuz();
        setColoresLuz(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('coloresLuz', false);
    }
  };

  // Handlers para Tipos
  const handleAddTipo = async (name: string) => {
    setSectionLoading('tipos', true);
    try {
      await createTipo({ nombre: name });
      const updatedData = await getTipos();
      setTipos(updatedData.map(item => item.nombre));
      handleCloseForm('tipos');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tipos', false);
    }
  };

  const handleEditTipo = async (oldName: string, newName: string) => {
    setSectionLoading('tipos', true);
    try {
      const currentData = await getTipos();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateTipo(itemToEdit.id, { nombre: newName });
        const updatedData = await getTipos();
        setTipos(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tipos', false);
    }
  };

  const handleDeleteTipo = async (name: string) => {
    setSectionLoading('tipos', true);
    try {
      const currentData = await getTipos();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteTipo(itemToDelete.id);
        const updatedData = await getTipos();
        setTipos(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tipos', false);
    }
  };

  // Handlers para Categorías
  const handleAddCategoria = async (name: string) => {
    setSectionLoading('categorias', true);
    try {
      await createCategoria({ nombre: name });
      const updatedData = await getCategorias();
      setCategorias(updatedData.map(item => item.nombre));
      handleCloseForm('categorias');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('categorias', false);
    }
  };

  const handleEditCategoria = async (oldName: string, newName: string) => {
    setSectionLoading('categorias', true);
    try {
      const currentData = await getCategorias();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateCategoria(itemToEdit.id, { nombre: newName });
        const updatedData = await getCategorias();
        setCategorias(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('categorias', false);
    }
  };

  const handleDeleteCategoria = async (name: string) => {
    setSectionLoading('categorias', true);
    try {
      const currentData = await getCategorias();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteCategoria(itemToDelete.id);
        const updatedData = await getCategorias();
        setCategorias(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('categorias', false);
    }
  };

  // Handlers para Ubicaciones
  const handleAddUbicacion = async (name: string) => {
    setSectionLoading('ubicaciones', true);
    try {
      await createUbicacion({ nombre: name });
      const updatedData = await getUbicaciones();
      setUbicaciones(updatedData.map(item => item.nombre));
      handleCloseForm('ubicaciones');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('ubicaciones', false);
    }
  };

  const handleEditUbicacion = async (oldName: string, newName: string) => {
    setSectionLoading('ubicaciones', true);
    try {
      const currentData = await getUbicaciones();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateUbicacion(itemToEdit.id, { nombre: newName });
        const updatedData = await getUbicaciones();
        setUbicaciones(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('ubicaciones', false);
    }
  };

  const handleDeleteUbicacion = async (name: string) => {
    setSectionLoading('ubicaciones', true);
    try {
      const currentData = await getUbicaciones();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteUbicacion(itemToDelete.id);
        const updatedData = await getUbicaciones();
        setUbicaciones(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('ubicaciones', false);
    }
  };

  // Handlers para Watts
  const handleAddWatts = async (name: string) => {
    setSectionLoading('watts', true);
    try {
      await createWatt({ nombre: name });
      const updatedData = await getWatts();
      setWatts(updatedData.map(item => item.nombre));
      handleCloseForm('watts');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('watts', false);
    }
  };

  const handleEditWatts = async (oldName: string, newName: string) => {
    setSectionLoading('watts', true);
    try {
      const currentData = await getWatts();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateWatt(itemToEdit.id, { nombre: newName });
        const updatedData = await getWatts();
        setWatts(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('watts', false);
    }
  };

  const handleDeleteWatts = async (name: string) => {
    setSectionLoading('watts', true);
    try {
      const currentData = await getWatts();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteWatt(itemToDelete.id);
        const updatedData = await getWatts();
        setWatts(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('watts', false);
    }
  };

  // Handlers para Tamaños
  const handleAddTamaño = async (name: string) => {
    setSectionLoading('tamanos', true);
    try {
      await createTamano({ nombre: name });
      const updatedData = await getTamanos();
      setTamaños(updatedData.map(item => item.nombre));
      handleCloseForm('tamanos');
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tamanos', false);
    }
  };

  const handleEditTamaño = async (oldName: string, newName: string) => {
    setSectionLoading('tamanos', true);
    try {
      const currentData = await getTamanos();
      const itemToEdit = currentData.find(item => item.nombre === oldName);
      if (itemToEdit) {
        await updateTamano(itemToEdit.id, { nombre: newName });
        const updatedData = await getTamanos();
        setTamaños(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tamanos', false);
    }
  };

  const handleDeleteTamaño = async (name: string) => {
    setSectionLoading('tamanos', true);
    try {
      const currentData = await getTamanos();
      const itemToDelete = currentData.find(item => item.nombre === name);
      if (itemToDelete) {
        await deleteTamano(itemToDelete.id);
        const updatedData = await getTamanos();
        setTamaños(updatedData.map(item => item.nombre));
      }
    } catch (error) {
      throw error;
    } finally {
      setSectionLoading('tamanos', false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Configuración del Sistema</h1>
      </div>

      {/* Secciones de gestión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManagementSection
          title="Colores de Diseño"
          icon={Palette}
          iconColor="text-pink-600"
          data={coloresDiseno}
          onAdd={handleAddColorDiseno}
          onEdit={handleEditColorDiseno}
          onDelete={handleDeleteColorDiseno}
          onCloseForm={() => handleCloseForm('coloresDiseno')}
          loading={loadingStates.coloresDiseno}
          isFormOpen={openForms.coloresDiseno}
          onToggleForm={(isOpen) => toggleForm('coloresDiseno', isOpen)}
        />

        <ManagementSection
          title="Colores de Luz"
          icon={Palette}
          iconColor="text-yellow-600"
          data={coloresLuz}
          onAdd={handleAddColorLuz}
          onEdit={handleEditColorLuz}
          onDelete={handleDeleteColorLuz}
          onCloseForm={() => handleCloseForm('coloresLuz')}
          loading={loadingStates.coloresLuz}
          isFormOpen={openForms.coloresLuz}
          onToggleForm={(isOpen) => toggleForm('coloresLuz', isOpen)}
        />

        <ManagementSection
          title="Tipos"
          icon={Settings}
          iconColor="text-blue-600"
          data={tipos}
          onAdd={handleAddTipo}
          onEdit={handleEditTipo}
          onDelete={handleDeleteTipo}
          onCloseForm={() => handleCloseForm('tipos')}
          loading={loadingStates.tipos}
          isFormOpen={openForms.tipos}
          onToggleForm={(isOpen) => toggleForm('tipos', isOpen)}
        />

        <ManagementSection
          title="Categorías"
          icon={Settings}
          iconColor="text-green-600"
          data={categorias}
          onAdd={handleAddCategoria}
          onEdit={handleEditCategoria}
          onDelete={handleDeleteCategoria}
          onCloseForm={() => handleCloseForm('categorias')}
          loading={loadingStates.categorias}
          isFormOpen={openForms.categorias}
          onToggleForm={(isOpen) => toggleForm('categorias', isOpen)}
        />

        <ManagementSection
          title="Ubicaciones"
          icon={Settings}
          iconColor="text-purple-600"
          data={ubicaciones}
          onAdd={handleAddUbicacion}
          onEdit={handleEditUbicacion}
          onDelete={handleDeleteUbicacion}
          onCloseForm={() => handleCloseForm('ubicaciones')}
          loading={loadingStates.ubicaciones}
          isFormOpen={openForms.ubicaciones}
          onToggleForm={(isOpen) => toggleForm('ubicaciones', isOpen)}
        />

        <ManagementSection
          title="Watts"
          icon={Settings}
          iconColor="text-orange-600"
          data={watts}
          onAdd={handleAddWatts}
          onEdit={handleEditWatts}
          onDelete={handleDeleteWatts}
          onCloseForm={() => handleCloseForm('watts')}
          loading={loadingStates.watts}
          isFormOpen={openForms.watts}
          onToggleForm={(isOpen) => toggleForm('watts', isOpen)}
        />

        <ManagementSection
          title="Tamaños"
          icon={Settings}
          iconColor="text-indigo-600"
          data={tamaños}
          onAdd={handleAddTamaño}
          onEdit={handleEditTamaño}
          onDelete={handleDeleteTamaño}
          onCloseForm={() => handleCloseForm('tamanos')}
          loading={loadingStates.tamanos}
          isFormOpen={openForms.tamanos}
          onToggleForm={(isOpen) => toggleForm('tamanos', isOpen)}
        />
      </div>
    </div>
  );
}