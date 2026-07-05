import React from 'react';

export const DgiiSignerMock: React.FC = () => {
  return (
    <div className="text-left my-3 w-full animate-crt-flicker">
      <div className="text-[var(--color-text-muted)] mb-2 font-bold">
        # Módulo de Firma Criptográfica e-CF (Ley 32-23 DGII)
      </div>
      <div className="text-[var(--color-text-muted)] mb-2 opacity-80 text-xs">
        # Implementación de Canonicalización XML (C14N) y Firma X.509 RSA-SHA256 para Lex32.
      </div>
      
      <pre className="text-xs sm:text-sm bg-[#050505] p-4 rounded border border-[var(--color-text-muted)] border-opacity-40 overflow-x-auto shadow-inner">
        <code className="text-gray-300 font-mono leading-relaxed">
<span className="text-pink-500">import</span> base64{'\n'}
<span className="text-pink-500">from</span> lxml <span className="text-pink-500">import</span> etree{'\n'}
<span className="text-pink-500">from</span> signxml <span className="text-pink-500">import</span> XMLSigner, methods{'\n\n'}

<span className="text-blue-400">def</span> <span className="text-yellow-200">sign_ecf_document</span>(xml_root: etree._Element, cert_pem: <span className="text-blue-400">bytes</span>, key_pem: <span className="text-blue-400">bytes</span>) -&gt; <span className="text-blue-400">str</span>:{'\n'}
{'    '}
<span className="text-green-600 opacity-80">"""{'\n'}</span>
<span className="text-green-600 opacity-80">    Inyecta el nodo &lt;Signature&gt; requerido por la norma técnica de la DGII.{'\n'}</span>
<span className="text-green-600 opacity-80">    Garantiza repudio cero mediante el estándar XML-DSig.{'\n'}</span>
<span className="text-green-600 opacity-80">    """</span>{'\n'}
{'    '}
<span className="text-pink-500">try</span>:{'\n'}
{'        '}signer = XMLSigner({'\n'}
{'            '}method=methods.enveloped,{'\n'}
{'            '}signature_algorithm=<span className="text-yellow-400">"rsa-sha256"</span>,{'\n'}
{'            '}digest_algorithm=<span className="text-yellow-400">"sha256"</span>,{'\n'}
{'            '}c14n_algorithm=<span className="text-yellow-400">"http://www.w3.org/TR/2001/REC-xml-c14n-20010315"</span>{'\n'}
{'        '}){'\n\n'}
{'        '}signed_root = signer.sign(xml_root, key=key_pem, cert=cert_pem){'\n'}
{'        '}<span className="text-pink-500">return</span> etree.tostring(signed_root, encoding=<span className="text-yellow-400">"UTF-8"</span>).decode(<span className="text-yellow-400">"utf-8"</span>){'\n\n'}
{'    '}<span className="text-pink-500">except</span> <span className="text-blue-400">Exception</span> <span className="text-pink-500">as</span> e:{'\n'}
{'        '}<span className="text-pink-500">raise</span> <span className="text-yellow-200">CryptographicSignatureError</span>(<span className="text-yellow-400">f"Fallo en serialización e-CF: </span><span className="text-blue-400">{'{'}e{'}'}</span><span className="text-yellow-400">"</span>)
        </code>
      </pre>
      
      <div className="mt-3 p-3 bg-yellow-500 bg-opacity-10 border-l-2 border-yellow-500 text-yellow-500 opacity-90 text-xs">
        <span className="font-bold">[!] Trazabilidad y Asincronía (TrackID):</span> Este módulo está acoplado a un bus de eventos (background queues) para enrutar las facturas serializadas hacia un búfer de contingencia local, garantizando latencia cero en el punto de venta (POS) incluso ante caídas de la API gubernamental.
      </div>
    </div>
  );
};
