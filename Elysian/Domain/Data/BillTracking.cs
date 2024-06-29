using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elysian.Domain.Data
{
    public class BillTracking
    {
        public int BillTrackingId { get; set; }
        public string UserId { get; set; }
        public int Congress { get; set; }
        public string BillType { get; set; }
        public int BillNumber { get; set; }
        public DateTime CreatedAt { get; set; }

        public class Configuration : IEntityTypeConfiguration<BillTracking>
        {
            public void Configure(EntityTypeBuilder<BillTracking> builder)
            {
                builder.HasKey(k => k.BillTrackingId);
                builder.Property(e => e.UserId).IsRequired();
                builder.Property(e => e.Congress).IsRequired();
                builder.Property(e => e.BillType).IsRequired();
                builder.Property(e => e.BillNumber).IsRequired();
                builder.Property(e => e.CreatedAt).IsRequired();

                builder.ToTable("BillTracking");
            }
        }
    }
}
