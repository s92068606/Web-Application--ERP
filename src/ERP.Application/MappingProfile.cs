using AutoMapper;
using ERP.Application.Models;
using ERP.Domain.Entities;

namespace ERP.Application;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Client, ClientDto>();
        CreateMap<Item, ItemDto>();
        CreateMap<SalesOrderItem, SalesOrderItemDto>().ReverseMap();
        CreateMap<SalesOrder, SalesOrderDto>().ReverseMap();
    }
}
