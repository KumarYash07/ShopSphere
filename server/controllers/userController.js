import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  try {
    const rawUser = await User.findById(req.user._id);
    if (!rawUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userObj = rawUser.toObject();
    const hasPassword = Boolean(userObj.password);
    delete userObj.password;

    return res.status(200).json({
      success: true,
      user: {
        ...userObj,
        hasPassword,
      },
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const preferences = user.notificationPreferences || {
      orderUpdates: true,
      deliveryUpdates: true,
      promotional: false,
      emailNotifications: true,
    };

    return res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Get Notification Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notification preferences.",
    });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        orderUpdates: true,
        deliveryUpdates: true,
        promotional: false,
        emailNotifications: true,
      };
    }

    const { orderUpdates, deliveryUpdates, promotional, emailNotifications } = req.body;

    if (orderUpdates !== undefined) user.notificationPreferences.orderUpdates = Boolean(orderUpdates);
    if (deliveryUpdates !== undefined) user.notificationPreferences.deliveryUpdates = Boolean(deliveryUpdates);
    if (promotional !== undefined) user.notificationPreferences.promotional = Boolean(promotional);
    if (emailNotifications !== undefined) user.notificationPreferences.emailNotifications = Boolean(emailNotifications);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully.",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Update Notification Preferences Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification preferences.",
    });
  }
};