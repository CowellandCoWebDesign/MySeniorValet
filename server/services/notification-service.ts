const users = await db.select()
        .from(users)
        .where(inArray(users.id, recipientIds));

      const emails = users.map(u => u.email).filter(Boolean);