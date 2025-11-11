import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function resetPassword() {
  console.log("🔒 Resetting password for william.cowell01@gmail.com...");
  
  try {
    // Hash the new password
    const newPassword = "TempPassword123!";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update william's password
    const result = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, "william.cowell01@gmail.com"))
      .returning();
    
    if (result.length > 0) {
      console.log("✅ Password reset successfully!");
      console.log("Email: william.cowell01@gmail.com");
      console.log("New Password: TempPassword123!");
      console.log("Please change this password after logging in.");
    } else {
      console.log("❌ User not found");
    }
    
    // Also reset admin@myseniorvalet.com as backup
    const adminResult = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.email, "admin@myseniorvalet.com"))
      .returning();
    
    if (adminResult.length > 0) {
      console.log("\n✅ Admin backup password also reset!");
      console.log("Email: admin@myseniorvalet.com");
      console.log("Password: TempPassword123!");
    }
    
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetPassword();