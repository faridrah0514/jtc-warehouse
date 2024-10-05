// Type for Tipe Aset
export interface TipeAset {
  id: number; // Unique identifier
  tipe_aset: string; // Name of the asset type
  // Add any additional fields from your API response as needed
}

// Type for Tipe Sertifikat
export interface TipeSertifikat {
  id: number; // Unique identifier
  tipe_sertifikat: string; // Name of the certificate type
  masa_berlaku: number; // Validity period of the certificate
  // Add any additional fields from your API response as needed
}

// Type for Cash Flow Category
export interface CashFlowCategory {
  id: string; // Unique identifier for the category (e.g., 'CFI-001')
  name: string; // Name of the category
  type: "incoming" | "outgoing"; // Type of cash flow ('incoming' or 'outgoing')
  description: string; // Description of the category
}
