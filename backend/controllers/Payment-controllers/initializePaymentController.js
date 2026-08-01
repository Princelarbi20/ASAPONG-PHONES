
export const initializePaymentController = async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Email and amount are required.",
      });
    }

    const response = await fetch(
      `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // GHS -> pesewas
          currency: "GHS",
          callback_url: `${process.env.CLIENT_URL}`,
          metadata: {
            orderId,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to initialize payment.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      data: data.data,
    });
  } catch (error) {
    console.error("Paystack Initialize Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
