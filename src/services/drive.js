/**
 * Sube un archivo a Google Drive usando la API REST (Upload Multipart).
 * Esto permite enviar la metadata (como el nuevo nombre) y el archivo físico en una sola petición.
 * * @param {File} file - El objeto File original que seleccionó el usuario.
 * @param {string} forcedName - El nuevo nombre estructurado (ej. "2026-05-02 - Proveedor - F001.pdf").
 * @param {string} accessToken - El token de Google obtenido en el login.
 * @returns {Promise<string>} - Retorna el link de vista previa (webViewLink) del archivo subido.
 */
export async function uploadFileToDrive(file, forcedName, accessToken) {
    if (!accessToken) {
      throw new Error('No hay token de Google Drive disponible. Inicia sesión nuevamente.');
    }
  
    // 1. Preparamos la metadata del archivo (Nombre nuevo y tipo MIME)
    const metadata = {
      name: forcedName,
      mimeType: file.type || 'application/pdf',
      // Si en el futuro quieres que los archivos caigan dentro de una carpeta específica
      // de Drive (por ejemplo, una por proyecto), puedes pasar el ID de esa carpeta así:
      // parents: ['TU_CARPETA_ID_AQUI']
    };
  
    // 2. Construimos el cuerpo multipart (FormData)
    const form = new FormData();
    
    // Añadimos la metadata como un Blob JSON (es un requisito estricto de la API de Drive)
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    
    // Añadimos el archivo físico
    form.append('file', file);
  
    // 3. Hacemos la petición HTTP a la API de Drive
    // Usamos uploadType=multipart y pedimos que nos devuelva el id y el webViewLink
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Nota: NO establecemos el 'Content-Type' aquí. 
          // El navegador lo establece automáticamente a 'multipart/form-data' 
          // con el "boundary" correcto al pasarle el objeto FormData.
        },
        body: form,
      }
    );
  
    // 4. Manejo de errores
    if (!response.ok) {
      let errorMessage = 'Fallo desconocido al subir a Drive';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Si el error no es un JSON válido
      }
      throw new Error(`Error de Drive: ${errorMessage}`);
    }
  
    // 5. Retornamos la respuesta exitosa
    const data = await response.json();
    
    // data contendrá { id: '...', webViewLink: '...' }
    return data.webViewLink;
  }