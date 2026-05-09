using Eventflow.Data;
using Microsoft.EntityFrameworkCore;

public class Repository<T, TKey> : IRepository<T, TKey> where T: class
{
    //T is generic entity type while Tkey is the key
    protected readonly AppDbContext _db;
    public Repository(AppDbContext db)
    {
        _db = db;
    }

    public async Task <T?> GetByIdAsync(TKey id)
    {
        return await _db.Set<T>().FindAsync(id);

    }
     public async Task<List<T>> GetAllAsync()
     {
        return await _db.Set<T>().ToListAsync();
     }
     public async Task AddAsync(T entity)
     {
         await _db.Set<T>().AddAsync(entity);
     }
     public async Task DeleteAsync(TKey id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
            _db.Set<T>().Remove(entity);
    }
    public async Task SaveChangesAsync()
    {
         await _db.SaveChangesAsync();
    }

}