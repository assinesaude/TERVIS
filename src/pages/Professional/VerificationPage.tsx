import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Upload, FileText, Check, X, Clock, Shield, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  uploaded_at: string;
}

export function VerificationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    if (user) {
      loadProfessionalData();
      loadDocuments();
    }
  }, [user]);

  async function loadProfessionalData() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfessionalData(data);
    } catch (error) {
      console.error('Error loading professional data:', error);
    }
  }

  async function loadDocuments() {
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!professional) return;

      const { data, error } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('professional_id', professional.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !documentType) return;

    setUploading(true);

    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!professional) throw new Error('Professional profile not found');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos_verificacao')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { error: docError } = await supabase
        .from('professional_documents')
        .insert({
          professional_id: professional.id,
          document_type: documentType,
          file_path: fileName,
          file_name: selectedFile.name,
        });

      if (docError) throw docError;

      setSelectedFile(null);
      setDocumentType('');
      loadDocuments();
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  const isVerified = professionalData?.verification_status === 'verified';
  const isPending = professionalData?.verification_status === 'pending';
  const hasDocuments = documents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tervis-blue/5 via-white to-tervis-green/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Verificação Profissional</h1>
          <p className="text-gray-600">Envie seus documentos para se tornar um profissional verificado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <Shield className={`w-12 h-12 mx-auto mb-3 ${isVerified ? 'text-tervis-green' : 'text-gray-400'}`} />
            <h3 className="font-semibold mb-1">Verificação</h3>
            <p className="text-sm text-gray-600">
              {isVerified ? 'Verificado' : isPending ? 'Em análise' : 'Pendente'}
            </p>
          </Card>

          <Card className="text-center">
            <FileText className={`w-12 h-12 mx-auto mb-3 ${hasDocuments ? 'text-tervis-blue' : 'text-gray-400'}`} />
            <h3 className="font-semibold mb-1">Documentos</h3>
            <p className="text-sm text-gray-600">{documents.length} enviado(s)</p>
          </Card>

          <Card className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold mb-1">Tempo Médio</h3>
            <p className="text-sm text-gray-600">24-48 horas</p>
          </Card>
        </div>

        {isVerified && (
          <Card className="mb-8 bg-gradient-green border-2 border-tervis-green/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                <Check className="w-6 h-6 text-tervis-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Perfil Verificado!</h3>
                <p className="text-white/90">Seu perfil foi verificado e está visível para pacientes</p>
              </div>
              <Button variant="outline" className="bg-white border-white text-tervis-green hover:bg-gray-50">
                Ver Perfil Público
              </Button>
            </div>
          </Card>
        )}

        {!isVerified && (
          <Card className="mb-8 bg-gradient-to-r from-tervis-blue/10 to-tervis-green/10">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-tervis-blue mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Por que ser verificado?</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-tervis-green mr-2" />
                    Ganhe credibilidade e confiança dos pacientes
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-tervis-green mr-2" />
                    Apareça com destaque nas buscas
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-tervis-green mr-2" />
                    Acesse recursos exclusivos da plataforma
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-tervis-green mr-2" />
                    Receba o selo "Profissional Verificado TERVIS"
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {!isVerified && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">Enviar Documentos</h2>
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tervis-blue focus:border-transparent"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="CRP">CRP - Conselho Regional de Psicologia</option>
                  <option value="CRM">CRM - Conselho Regional de Medicina</option>
                  <option value="CRO">CRO - Conselho Regional de Odontologia</option>
                  <option value="CREFITO">CREFITO - Conselho Regional de Fisioterapia</option>
                  <option value="CRN">CRN - Conselho Regional de Nutrição</option>
                  <option value="COREN">COREN - Conselho Regional de Enfermagem</option>
                  <option value="CREFONO">CREFONO - Conselho Regional de Fonoaudiologia</option>
                  <option value="OUTRO">Outro Registro Profissional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-tervis-blue transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    {selectedFile ? (
                      <p className="text-tervis-blue font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-gray-700 font-medium mb-1">Clique para selecionar um arquivo</p>
                        <p className="text-sm text-gray-500">ou arraste e solte aqui</p>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tamanho máximo: 5MB. Formatos aceitos: PDF, JPG, PNG
                </p>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={uploading || !selectedFile || !documentType}
              >
                {uploading ? 'Enviando...' : 'Enviar Documento'}
              </Button>
            </form>
          </Card>
        )}

        {documents.length > 0 && (
          <Card className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Documentos Enviados</h2>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center flex-1">
                    <FileText className="w-8 h-8 text-tervis-blue mr-3" />
                    <div>
                      <p className="font-medium">{doc.document_type}</p>
                      <p className="text-sm text-gray-600">{doc.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {doc.status === 'pending' && (
                      <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        Em análise
                      </span>
                    )}
                    {doc.status === 'approved' && (
                      <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Aprovado
                      </span>
                    )}
                    {doc.status === 'rejected' && (
                      <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        <X className="w-4 h-4 mr-1" />
                        Rejeitado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}