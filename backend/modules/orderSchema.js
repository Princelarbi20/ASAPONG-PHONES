import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1 unit"],
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    deliveryNotes: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "UNPAID"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["CASH_ON_DELIVERY", "PAYSTACK"],
      default: "CASH_ON_DELIVERY",
    },

    paymentProvider: {
      type: String,
      default: null,
    },

    transactionReference: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      set: (value) => {
        if (typeof value !== 'string') return undefined;
        const trimmed = value.trim();
        return trimmed || undefined;
      },
    },

    transactionId: {
      type: String,
      default: null,
    },

    currency: {
      type: String,
      default: 'GHS',
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    paymentMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    paymentResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    verifiedByBackend: {
      type: Boolean,
      default: false,
    },

    statusHistory: [{
      status: { type: String, required: true },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
      changedAt: { type: Date, default: Date.now },
      note: { type: String, default: '' },
    }],

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      default: null,
    },

    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);


export const Orders = mongoose.model("Orders", orderSchema);