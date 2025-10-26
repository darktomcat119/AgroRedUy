import React from "react";

const serviceDetails = {
  name: "Ricardo Mollo",
  price: "USD 200",
  contact: "099 123 456",
  description: "Hace más de 20 años que trabajamos con un equipo responsable para que tu cosecha no sea un problema"
};

export const ServiceDetailsCard = (): JSX.Element => {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[4px_4px_4px_#00000040]">
      {/* Service Details with inline layout */}
      <div className="space-y-0">
        {/* Cosechador */}
        <div className="flex items-center border-b border-gray-300 py-3">
          <span className="text-sm font-bold text-gray-800 mr-4">Cosechador:</span>
          <span className="text-sm font-medium text-gray-800">{serviceDetails.name}</span>
        </div>
        
        {/* Precio */}
        <div className="flex items-center border-b border-gray-300 py-3">
          <span className="text-sm font-bold text-gray-800 mr-4">Precio x hectárea estimado:</span>
          <span className="text-sm font-medium text-gray-800">{serviceDetails.price}</span>
        </div>
        
        {/* Contacto */}
        <div className="flex items-center border-b border-gray-300 py-3">
          <span className="text-sm font-bold text-gray-800 mr-4">Contacto:</span>
          <span className="text-sm font-medium text-gray-800">{serviceDetails.contact}</span>
        </div>
        
        {/* Descripción */}
        <div className="flex items-start py-3">
          <span className="text-sm font-bold text-gray-800 mr-4 flex-shrink-0">Descripción:</span>
          <span className="text-sm font-medium text-gray-800 leading-relaxed">{serviceDetails.description}</span>
        </div>
      </div>
    </div>
  );
};
